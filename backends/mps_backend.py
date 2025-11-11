"""MPS Backend for Apple Silicon - Using DeepSeek-OCR with MPS"""
from typing import Optional
from transformers import AutoProcessor, AutoModel
import torch
import platform

class MPSBackend:
    def __init__(self, model_path: str = "deepseek-ai/DeepSeek-OCR"):
        self.model_path = model_path
        self.revision = "1e3401a3d4603e9e71ea0ec850bfead602191ec4"  # MPS support
        self.model = None
        self.processor = None
        self.device = "mps"
        
    def load_model(self):
        """Load model with MPS acceleration"""
        try:
            print(f"📦 Loading DeepSeek-OCR with MPS")
            
            self.processor = AutoProcessor.from_pretrained(
                self.model_path,
                revision=self.revision,
                trust_remote_code=True
            )
            
            self.model = AutoModel.from_pretrained(
                self.model_path,
                revision=self.revision,
                trust_remote_code=True,
                torch_dtype=torch.float32,  # float32 for MPS compatibility
                low_cpu_mem_usage=True
            ).to(self.device)
            
            self.model.eval()
            print(f"✅ Model loaded on {self.device}")
            return True
            
        except Exception as e:
            print(f"❌ Model loading failed: {e}")
            raise
    
    def infer(self, prompt: str, image_path: str, base_size: int = 1024, 
              image_size: int = 640, crop_mode: bool = True, **kwargs) -> str:
        """
        Run inference using model's infer method.
        
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
            # Use model's built-in infer method with eval_mode=True to get return value
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
                eval_mode=True  # Important: enables return value
            )
            
            return result if result else ""
            
        except Exception as e:
            print(f"❌ Inference failed: {e}")
            raise
    
    @staticmethod
    def is_available() -> bool:
        """Check if MPS is available"""
        try:
            import torch
            return (platform.system() == "Darwin" and 
                    platform.machine() == "arm64" and
                    torch.backends.mps.is_available())
        except ImportError:
            return False
