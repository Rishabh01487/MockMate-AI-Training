# MockMate AI — Custom Model Training Pipeline

## 🧠 What This Does

This project trains a **custom AI model** using data collected from MockMate interviews. As candidates practice on MockMate, every question and answer is saved. After collecting enough data (500+ samples), you fine-tune a model that becomes **your own AI** — specialized for CS interview questions.

## 📁 Folder Structure

```
MockMate-AI-Training/
├── dashboard.html              ← Monitoring dashboard (open in browser)
├── scripts/
│   └── export_data.py          ← Export training data from MongoDB
├── notebooks/
│   └── train_model.ipynb       ← Google Colab training notebook
├── data/                       ← Exported JSONL training files
├── models/                     ← Your fine-tuned model (GGUF)
└── README.md
```

## 🚀 How It Works

### Phase 1: Data Collection (Automatic)
- Candidates use MockMate to practice interviews
- Every AI-generated question + candidate answer is logged to MongoDB
- No action needed — happens in the background

### Phase 2: Export Data
```bash
pip install pymongo
python scripts/export_data.py
```
This exports all training data to `data/training_data.jsonl`

### Phase 3: Train Model (Google Colab — Free GPU)
1. Go to [Google Colab](https://colab.research.google.com)
2. Upload `notebooks/train_model.ipynb`
3. Set runtime to **T4 GPU** (Runtime → Change runtime → T4)
4. Upload your `data/training_data.jsonl` when prompted
5. Run all cells — training takes ~30-60 minutes
6. Download the exported `.gguf` model file

### Phase 4: Deploy Your Model
1. Save the `.gguf` file to `F:\MockMate-AI-Training\models\`
2. Create a Modelfile:
```
FROM ./models/mockmate-ai-model.gguf
SYSTEM "You are MockMate AI, an expert CS interview question generator."
```
3. Register with Ollama:
```bash
cd F:\MockMate-AI-Training
ollama create mockmate-ai -f Modelfile
```
4. Update MockMate's `.env`:
```
OLLAMA_API_URL=http://localhost:11434
AI_MODEL=mockmate-ai
```

## 📊 Dashboard
Open `dashboard.html` in your browser to monitor:
- Total training samples collected
- Domain breakdown
- Export status
- Fine-tuning readiness

## ⏱️ Timeline
| Milestone | When |
|-----------|------|
| Start collecting | Now |
| 500 samples | ~2-4 weeks of active use |
| Fine-tune model | 30-60 min on Colab |
| Deploy custom AI | Same day |

## 🔧 Requirements
- **Python 3.10+** (for export script)
- **Google Colab** (free T4 GPU for training)
- **Ollama** (for running the model locally)
