"""CUDA Backend for NVIDIA GPUs"""
import os
from transformers import AutoProcessor, AutoModel
import torch
import warnings

# Suppress specific warnings
warnings.filterwarnings('ignore', message='.*position_ids.*position_embeddings.*')
warnings.filterwarnings('ignore', message='.*exceed the model.*predefined maximum length.*')
warnings.filterwarnings('ignore', message='.*attention_mask.*pad_token_id.*')
os.environ['TOKENIZERS_PARALLELISM'] = 'false'

class CUDABackend:
    def __init__(self, model_path: str = "deepseek-ai/DeepSeek-OCR"):
        self.model_path = model_path
        self.revision = "1e3401a3d4603e9e71ea0ec850bfead602191ec4"  # MPS support commit
        self.model = None
        self.processor = None
        self.max_length = 8192  # Model's maximum length
        
    def load_model(self, source: str = "huggingface", timeout: int = 300):
        """Load CUDA model"""
        try:
            print(f"📦 Loading DeepSeek-OCR on CUDA")
            
            if source == "modelscope":
                # ModelScope fallback for China
                from modelscope import snapshot_download
                local_path = snapshot_download(
                    model_id=self.model_path,
                    cache_dir=os.environ.get('MODELSCOPE_CACHE', '~/.cache/modelscope'),
                    revision='master'
                )
                model_path = local_path
                revision = None
            else:
                os.environ['HF_HUB_DOWNLOAD_TIMEOUT'] = str(timeout)
                model_path = self.model_path
                revision = self.revision
            
            self.processor = AutoProcessor.from_pretrained(
                model_path,
                revision=revision,
                trust_remote_code=True
            )
            
            # Set processor/tokenizer max length and pad token
            if hasattr(self.processor, 'model_max_length'):
                self.processor.model_max_length = self.max_length
            if hasattr(self.processor, 'pad_token_id') and self.processor.pad_token_id is None:
                self.processor.pad_token_id = self.processor.eos_token_id
            
            self.model = AutoModel.from_pretrained(
                model_path,
                revision=revision,
                trust_remote_code=True,
                torch_dtype=torch.bfloat16,
                low_cpu_mem_usage=True
            ).to("cuda")
            
            # Configure generation settings if available
            if hasattr(self.model, 'generation_config'):
                if hasattr(self.model.generation_config, 'max_length'):
                    self.model.generation_config.max_length = self.max_length
                if hasattr(self.model.generation_config, 'pad_token_id'):
                    self.model.generation_config.pad_token_id = self.processor.eos_token_id
            
            self.model.eval()
            print(f"✅ Model loaded on CUDA from {source}")
            return True
            
        except Exception as e:
            print(f"❌ Model loading failed: {e}")
            raise
    
    def infer(self, prompt: str, image_path: str, base_size: int = 1024,
              image_size: int = 640, crop_mode: bool = True, **kwargs) -> str:
        """
        Run inference on CUDA.
        
        Args:
            prompt: OCR prompt with mode instructions
            image_path: Path to the image file
            base_size: Base resolution for image processing (default: 1024)
            image_size: Patch size for vision encoder (default: 640)
            crop_mode: Enable image cropping to improve accuracy (default: True)
            **kwargs: Additional arguments (ignored)
        
        Returns:
            str: OCR result text
        """
        try:
            result = self.model.infer(
                tokenizer=self.processor,
                prompt=prompt,
                image_file=image_path,
                output_path='./output',
                base_size=base_size,
                image_size=image_size,
                crop_mode=crop_mode,
                test_compress=False,
                save_results=False,
                eval_mode=True
            )
            return result if result else ""
        except Exception as e:
            print(f"❌ Inference failed: {e}")
            raise
    
    @staticmethod
    def is_available() -> bool:
        """Check if CUDA is available"""
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False
