"""Transformers Backend for CPU/MPS"""
from typing import Optional
from PIL import Image
from transformers import AutoProcessor, AutoModelForVision2Seq
import torch
import warnings
import os

# Suppress specific warnings
warnings.filterwarnings('ignore', message='.*position_ids.*position_embeddings.*')
warnings.filterwarnings('ignore', message='.*exceed the model.*predefined maximum length.*')
warnings.filterwarnings('ignore', message='.*attention_mask.*pad_token_id.*')
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

class TransformersBackend:
    def __init__(self, model_path: str = "deepseek-ai/DeepSeek-OCR"):
        self.model_path = model_path
        self.model = None
        self.processor = None
        self.device = "mps" if torch.backends.mps.is_available() else "cpu"
        self.max_length = 8192  # Model's maximum length
        
    def load_model(self):
        """Load model with transformers"""
        try:
            print(f"📦 Loading model: {self.model_path} on {self.device}")
            self.processor = AutoProcessor.from_pretrained(
                self.model_path,
                trust_remote_code=True
            )
            
            # Set processor/tokenizer max length and pad token
            if hasattr(self.processor, 'model_max_length'):
                self.processor.model_max_length = self.max_length
            if hasattr(self.processor, 'pad_token_id') and self.processor.pad_token_id is None:
                self.processor.pad_token_id = self.processor.eos_token_id
            
            self.model = AutoModelForVision2Seq.from_pretrained(
                self.model_path,
                trust_remote_code=True,
                torch_dtype=torch.float16 if self.device == "mps" else torch.float32
            ).to(self.device)
            
            # Configure generation settings if available
            if hasattr(self.model, 'generation_config'):
                if hasattr(self.model.generation_config, 'max_length'):
                    self.model.generation_config.max_length = self.max_length
                if hasattr(self.model.generation_config, 'pad_token_id'):
                    self.model.generation_config.pad_token_id = self.processor.eos_token_id
            
            print(f"✅ Model loaded successfully on {self.device}")
            return True
        except Exception as e:
            print(f"❌ Model loading failed: {e}")
            raise
    
    def infer(self, prompt: str, image_path: str, **kwargs) -> str:
        """Run inference"""
        try:
            image = Image.open(image_path).convert('RGB')
            
            inputs = self.processor(
                text=prompt,
                images=image,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=self.max_length
            ).to(self.device)
            
            # Set attention_mask if not present
            if 'attention_mask' not in inputs:
                inputs['attention_mask'] = torch.ones_like(inputs['input_ids'])
            
            max_new_tokens = min(kwargs.get('max_tokens', 2048), self.max_length - inputs['input_ids'].shape[1])
            
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                temperature=kwargs.get('temperature', 0.0),
                do_sample=False,
                pad_token_id=self.processor.eos_token_id,
                eos_token_id=self.processor.eos_token_id
            )
            
            result = self.processor.decode(outputs[0], skip_special_tokens=True)
            return result
            
        except Exception as e:
            print(f"❌ Inference failed: {e}")
            raise
    
    @staticmethod
    def is_available() -> bool:
        """Always available if torch is installed"""
        try:
            import torch
            return True
        except ImportError:
            return False
