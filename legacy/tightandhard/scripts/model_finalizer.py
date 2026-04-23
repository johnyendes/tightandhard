#!/usr/bin/env python3
"""
Model Finalizer - Exports the full model as .model or .json companion file
Links together: anatomy config + persona + voice + outfit → final output
"""

import json
import os
import pickle
import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Union
from dataclasses import dataclass, asdict


@dataclass
class AnatomyConfig:
    """Character anatomy configuration"""
    height: float
    build: str
    proportions: Dict[str, float]
    features: Dict[str, Any]
    
    
@dataclass
class PersonaConfig:
    """Character personality and behavior configuration"""
    name: str
    personality_traits: Dict[str, float]
    background: str
    goals: list
    relationships: Dict[str, Any]
    

@dataclass
class VoiceConfig:
    """Character voice and speech configuration"""
    voice_type: str
    pitch: float
    speed: float
    accent: str
    speech_patterns: Dict[str, Any]
    

@dataclass
class OutfitConfig:
    """Character appearance and clothing configuration"""
    style: str
    colors: Dict[str, str]
    accessories: list
    textures: Dict[str, str]
    seasonal_variants: Dict[str, Any]


@dataclass
class FinalModel:
    """Complete character model combining all components"""
    model_id: str
    created_at: str
    version: str
    anatomy: AnatomyConfig
    persona: PersonaConfig
    voice: VoiceConfig
    outfit: OutfitConfig
    metadata: Dict[str, Any]


class ModelFinalizer:
    """Handles the finalization and export of character models"""
    
    def __init__(self, package_folder: Optional[str] = None):
        self.package_folder = Path(package_folder) if package_folder else Path("./models")
        self.package_folder.mkdir(exist_ok=True)
        self.version = "1.0.0"
    
    def create_model(self, 
                    anatomy: AnatomyConfig,
                    persona: PersonaConfig, 
                    voice: VoiceConfig,
                    outfit: OutfitConfig,
                    model_id: Optional[str] = None) -> FinalModel:
        """
        Combine all components into a final model
        
        Args:
            anatomy: Character anatomy configuration
            persona: Character personality configuration
            voice: Character voice configuration
            outfit: Character appearance configuration
            model_id: Optional custom model ID
            
        Returns:
            FinalModel: Complete character model
        """
        if not model_id:
            model_id = f"{persona.name.lower().replace(' ', '_')}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        metadata = {
            "creator": os.getenv("USER", "unknown"),
            "creation_time": datetime.datetime.now().isoformat(),
            "file_format_version": self.version,
            "components": {
                "anatomy": True,
                "persona": True, 
                "voice": True,
                "outfit": True
            }
        }
        
        return FinalModel(
            model_id=model_id,
            created_at=datetime.datetime.now().isoformat(),
            version=self.version,
            anatomy=anatomy,
            persona=persona,
            voice=voice,
            outfit=outfit,
            metadata=metadata
        )
    
    def export_as_json(self, 
                      model: FinalModel, 
                      filepath: Optional[Union[str, Path]] = None,
                      pretty_print: bool = True) -> Path:
        """
        Export model as JSON companion file
        
        Args:
            model: The final model to export
            filepath: Optional custom file path
            pretty_print: Whether to format JSON with indentation
            
        Returns:
            Path: Path to the saved JSON file
        """
        if not filepath:
            filepath = self.package_folder / f"{model.model_id}.json"
        else:
            filepath = Path(filepath)
        
        # Create directory if it doesn't exist
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Convert model to dictionary
        model_dict = asdict(model)
        
        # Write JSON file
        with open(filepath, 'w', encoding='utf-8') as f:
            if pretty_print:
                json.dump(model_dict, f, indent=2, ensure_ascii=False)
            else:
                json.dump(model_dict, f, ensure_ascii=False)
        
        print(f"✅ Model exported as JSON: {filepath}")
        return filepath
    
    def export_as_model(self, 
                       model: FinalModel,
                       filepath: Optional[Union[str, Path]] = None) -> Path:
        """
        Export model as binary .model file
        
        Args:
            model: The final model to export
            filepath: Optional custom file path
            
        Returns:
            Path: Path to the saved .model file
        """
        if not filepath:
            filepath = self.package_folder / f"{model.model_id}.model"
        else:
            filepath = Path(filepath)
        
        # Create directory if it doesn't exist
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Write binary model file
        with open(filepath, 'wb') as f:
            pickle.dump(model, f, protocol=pickle.HIGHEST_PROTOCOL)
        
        print(f"✅ Model exported as .model: {filepath}")
        return filepath
    
    def load_model(self, filepath: Union[str, Path]) -> FinalModel:
        """
        Load a model from either .json or .model file
        
        Args:
            filepath: Path to the model file
            
        Returns:
            FinalModel: Loaded model
        """
        filepath = Path(filepath)
        
        if filepath.suffix == '.json':
            return self._load_json_model(filepath)
        elif filepath.suffix == '.model':
            return self._load_binary_model(filepath)
        else:
            raise ValueError(f"Unsupported file format: {filepath.suffix}")
    
    def _load_json_model(self, filepath: Path) -> FinalModel:
        """Load model from JSON file"""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Reconstruct dataclass objects
        anatomy = AnatomyConfig(**data['anatomy'])
        persona = PersonaConfig(**data['persona'])
        voice = VoiceConfig(**data['voice'])
        outfit = OutfitConfig(**data['outfit'])
        
        return FinalModel(
            model_id=data['model_id'],
            created_at=data['created_at'],
            version=data['version'],
            anatomy=anatomy,
            persona=persona,
            voice=voice,
            outfit=outfit,
            metadata=data['metadata']
        )
    
    def _load_binary_model(self, filepath: Path) -> FinalModel:
        """Load model from binary .model file"""
        with open(filepath, 'rb') as f:
            return pickle.load(f)
    
    def export_both_formats(self, 
                           model: FinalModel,
                           base_path: Optional[Union[str, Path]] = None) -> tuple[Path, Path]:
        """
        Export model in both JSON and .model formats
        
        Args:
            model: The final model to export
            base_path: Optional base path (without extension)
            
        Returns:
            tuple: (json_path, model_path)
        """
        if base_path:
            base_path = Path(base_path)
            json_path = base_path.with_suffix('.json')
            model_path = base_path.with_suffix('.model')
        else:
            json_path = None
            model_path = None
        
        json_file = self.export_as_json(model, json_path)
        model_file = self.export_as_model(model, model_path)
        
        return json_file, model_file
    
    def list_models(self) -> list[Path]:
        """List all model files in the package folder"""
        models = []
        for ext in ['.json', '.model']:
            models.extend(self.package_folder.glob(f"*{ext}"))
        return sorted(models)
    
    def get_model_info(self, filepath: Union[str, Path]) -> Dict[str, Any]:
        """Get basic information about a model file without fully loading it"""
        filepath = Path(filepath)
        
        if filepath.suffix == '.json':
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return {
                'model_id': data.get('model_id'),
                'created_at': data.get('created_at'),
                'version': data.get('version'),
                'character_name': data.get('persona', {}).get('name'),
                'file_type': 'json',
                'file_size': filepath.stat().st_size
            }
        elif filepath.suffix == '.model':
            # For binary files, we need to load to get info
            model = self._load_binary_model(filepath)
            return {
                'model_id': model.model_id,
                'created_at': model.created_at,
                'version': model.version,
                'character_name': model.persona.name,
                'file_type': 'model',
                'file_size': filepath.stat().st_size
            }


# Example usage and testing
def create_example_model() -> FinalModel:
    """Create an example character model for testing"""
    
    # Example anatomy configuration
    anatomy = AnatomyConfig(
        height=5.6,
        build="athletic",
        proportions={
            "head_to_body": 1/8,
            "arm_span": 1.0,
            "leg_length": 0.55
        },
        features={
            "eye_color": "hazel",
            "hair_color": "auburn",
            "skin_tone": "medium"
        }
    )
    
    # Example persona configuration
    persona = PersonaConfig(
        name="Alex Chen",
        personality_traits={
            "openness": 0.8,
            "conscientiousness": 0.7,
            "extraversion": 0.6,
            "agreeableness": 0.9,
            "neuroticism": 0.3
        },
        background="Software engineer turned artist",
        goals=["create meaningful art", "help others learn technology"],
        relationships={
            "family": "close with siblings",
            "friends": "small but tight-knit group",
            "romantic": "single, looking for deep connection"
        }
    )
    
    # Example voice configuration
    voice = VoiceConfig(
        voice_type="warm_neutral",
        pitch=0.6,
        speed=0.8,
        accent="slight_regional",
        speech_patterns={
            "formality": "casual_professional",
            "humor_style": "dry_wit",
            "filler_words": ["um", "you know"],
            "emphasis_style": "gesture_based"
        }
    )
    
    # Example outfit configuration
    outfit = OutfitConfig(
        style="creative_casual",
        colors={
            "primary": "forest_green",
            "secondary": "cream",
            "accent": "rust_orange"
        },
        accessories=["vintage_watch", "small_earrings", "canvas_bag"],
        textures={
            "top": "soft_cotton",
            "bottom": "denim",
            "shoes": "worn_leather"
        },
        seasonal_variants={
            "winter": "add_wool_sweater",
            "summer": "lighter_fabrics"
        }
    )
    
    # Create finalizer and model
    finalizer = ModelFinalizer()
    return finalizer.create_model(anatomy, persona, voice, outfit)


if __name__ == "__main__":
    # Demo the model finalizer
    print("🚀 Model Finalizer Demo")
    print("=" * 50)
    
    # Create example model
    model = create_example_model()
    print(f"Created model: {model.model_id}")
    print(f"Character: {model.persona.name}")
    
    # Create finalizer
    finalizer = ModelFinalizer("./exported_models")
    
    # Export in both formats
    json_path, model_path = finalizer.export_both_formats(model)
    
    # List all models
    print("\n📁 Available models:")
    for model_file in finalizer.list_models():
        info = finalizer.get_model_info(model_file)
        print(f"  • {model_file.name} - {info['character_name']} ({info['file_type']})")
    
    # Test loading
    print("\n🔄 Testing model loading...")
    loaded_json = finalizer.load_model(json_path)
    loaded_model = finalizer.load_model(model_path)
    
    print(f"✅ JSON load successful: {loaded_json.persona.name}")
    print(f"✅ Model load successful: {loaded_model.persona.name}")
    
    print("\n🎉 Model Finalizer demo complete!")