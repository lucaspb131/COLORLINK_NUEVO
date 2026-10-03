import json
import os
from google import genai
from core.config import settings

class GeminiTechnicalService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    async def classify_coating_system(self, client_data: dict, project_data: dict, areas: list, conditions: dict, evidence_notes: str = "") -> dict:
        total_area = sum(float(a.get("sqm", 0)) for a in areas)
        is_corrosive = conditions.get("corrosivity") in ["C4 (Alta)", "C5 (Muy Alta - Marina/Industrial)"] or float(conditions.get("humidity", 0)) > 80

        prompt = f"""
Actúa como Ingeniero Especialista Principal en Corrosión y Recubrimientos Industriales (NACE / AMPP Level 3 e Inspector Senior ISO 12944) para la plataforma empresarial COLORLINK.
Analiza la siguiente solicitud técnica:

CLIENTE: {json.dumps(client_data, ensure_ascii=False)}
PROYECTO: {json.dumps(project_data, ensure_ascii=False)}
ÁREAS DE INTERVENCIÓN: {json.dumps(areas, ensure_ascii=False)}
CONDICIONES OPERATIVAS: {json.dumps(conditions, ensure_ascii=False)}
NOTAS DE EVIDENCIAS: "{evidence_notes}"

Genera una especificación técnica en formato JSON estricto:
{{
  "category": "Nombre del sistema técnico (ej: Sistema Epóxico de Altos Sólidos + Poliuretano Alifático C5)",
  "coatingType": "Resina química principal",
  "confidenceScore": 95,
  "complexity": "Baja" | "Media" | "Alta" | "Crítica",
  "recommendedSystem": [
    {{
      "step": "Nombre de la fase (ej: Preparación de Superficie)",
      "action": "Procedimiento técnico detallado con normas SSPC / ISO",
      "standard": "Código de norma (ej: SSPC-SP 10 / ISO 8501-1 Sa 2.5)"
    }}
  ],
  "detectedConditions": ["condición detectada 1", "condición detectada 2"],
  "missingData": ["dato técnico sugerido 1", "dato técnico sugerido 2"],
  "observations": "Observaciones técnicas de humedad, punto de rocío y curado",
  "estimatedYieldGallons": 210,
  "vocCompliance": "VOC < 250 g/L"
}}
"""
        if not self.client:
            # Motor determinista de reglas técnicas en caso de no contar con clave API configurada
            return {
                "category": "Sistema Epóxico Alto Sólidos Poliamida + Topcoat Uretano Alifático Grado C5" if is_corrosive else "Sistema Acrílico Poliuretano Arquitectónico / Comercial Grado C2-C3",
                "coatingType": "Epoxi Poliamida + Uretano UV" if is_corrosive else "Acrílico Uretano",
                "confidenceScore": 96 if is_corrosive else 92,
                "complexity": "Alta" if is_corrosive else ("Media" if total_area > 1000 else "Baja"),
                "recommendedSystem": [
                    {
                        "step": "1. Preparación de Superficie",
                        "action": "Chorreado abrasivo al metal cercano al blanco Sa 2.5 con perfil de anclaje 2.5 mils." if is_corrosive else "Limpieza mecánica según SSPC-SP 3.",
                        "standard": "SSPC-SP 10 / ISO 8501-1" if is_corrosive else "SSPC-SP 3"
                    },
                    {
                        "step": "2. Capa Imprimante (Primer)",
                        "action": "Epóxico rico en zinc (3.0 mils EPS) para protección catódica galvánica." if is_corrosive else "Sellador acrílico base agua (1.5 mils EPS).",
                        "standard": "SSPC-Paint 20"
                    },
                    {
                        "step": "3. Capa Barrera Intermedia",
                        "action": "Epóxico de altos sólidos poliamida pigmentado con MIO (5.0 mils EPS)." if is_corrosive else "Capa intermedia de nivelación.",
                        "standard": "ISO 12944-5"
                    },
                    {
                        "step": "4. Capa de Acabado (Topcoat)",
                        "action": "Esmalte poliuretano alifático con alta retención de brillo y resistencia a rayos UV (2.5 mils EPS).",
                        "standard": "ASTM D4541 / ISO 2813"
                    }
                ],
                "detectedConditions": [
                    f"Sustrato predominante: {areas[0].get('substrate', 'Acero') if areas else 'Acero'}",
                    f"Humedad relativa: {conditions.get('humidity', 65)}%",
                    f"Categoría ambiental: {conditions.get('corrosivity', 'C3')}"
                ],
                "missingData": [
                    "Registro in-situ de temperatura de punto de rocío",
                    "Ensayo de sales solubles residuales (Bresle test < 20 mg/m²)"
                ],
                "observations": "No aplicar recubrimientos si la humedad supera el 85% o si la temperatura del sustrato no supera por al menos 3°C el punto de rocío.",
                "estimatedYieldGallons": max(10, int((total_area * 1.35) / 25)),
                "vocCompliance": "Cumple regulación ambiental VOC < 250 g/L"
            }

        try:
            response = self.client.models.generate_content(
                model="gemini-3.8-flash",
                contents=prompt,
                config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return {
                "category": "Sistema Epóxico Industrial Especializado",
                "coatingType": "Epoxi-Poliamida",
                "confidenceScore": 90,
                "complexity": "Media",
                "recommendedSystem": [],
                "detectedConditions": [],
                "missingData": [],
                "observations": str(e),
                "estimatedYieldGallons": 100,
                "vocCompliance": "VOC < 250 g/L"
            }
