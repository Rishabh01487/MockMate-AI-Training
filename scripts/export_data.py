"""
MockMate AI — Export Training Data from MongoDB
=================================================
Connects to your MockMate MongoDB and exports all
training samples as JSONL files for fine-tuning.

Usage:
  python export_data.py

Output:
  ../data/training_data.jsonl  — All samples (Alpaca format)
  ../data/stats.json           — Export statistics
"""

import os
import json
from datetime import datetime
from pymongo import MongoClient

# ── Configuration ──
MONGO_URI = os.environ.get(
    'MONGODB_URI',
    'mongodb+srv://mockmate:Rishabh%4001@mockmate.aqjlnmx.mongodb.net/mockmate?retryWrites=true&w=majority'
)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

def export():
    print("🔌 Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client['mockmate']
    collection = db['trainingdatas']

    # Count total
    total = collection.count_documents({})
    print(f"📊 Found {total} training samples")

    if total == 0:
        print("⚠️  No training data yet. Use MockMate to practice and collect data first!")
        return

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Export as JSONL (Alpaca format for fine-tuning)
    output_path = os.path.join(OUTPUT_DIR, 'training_data.jsonl')
    domain_counts = {}
    type_counts = {}
    valid_count = 0

    with open(output_path, 'w', encoding='utf-8') as f:
        for doc in collection.find({}):
            # Alpaca format: instruction, input, output
            sample = {
                "instruction": doc.get('instruction', ''),
                "input": doc.get('input', ''),
                "output": doc.get('output', ''),
            }

            # Skip empty samples
            if not sample['instruction'] or not sample['output']:
                continue

            f.write(json.dumps(sample, ensure_ascii=False) + '\n')
            valid_count += 1

            # Track stats
            domain = doc.get('domain', 'unknown')
            qtype = doc.get('questionType', 'unknown')
            domain_counts[domain] = domain_counts.get(domain, 0) + 1
            type_counts[qtype] = type_counts.get(qtype, 0) + 1

    # Save stats
    stats = {
        "exported_at": datetime.now().isoformat(),
        "total_in_db": total,
        "valid_exported": valid_count,
        "by_domain": domain_counts,
        "by_type": type_counts,
        "ready_for_training": valid_count >= 500,
        "output_file": output_path
    }

    stats_path = os.path.join(OUTPUT_DIR, 'stats.json')
    with open(stats_path, 'w') as f:
        json.dump(stats, f, indent=2)

    print(f"\n✅ Exported {valid_count} samples → {output_path}")
    print(f"📈 Stats saved → {stats_path}")
    print(f"\n📊 By Domain:")
    for d, c in sorted(domain_counts.items(), key=lambda x: -x[1]):
        print(f"   {d:20s} {c}")
    print(f"\n📊 By Type:")
    for t, c in sorted(type_counts.items(), key=lambda x: -x[1]):
        print(f"   {t:20s} {c}")

    if valid_count >= 500:
        print(f"\n🎉 You have enough data! Upload train_model.ipynb to Google Colab to start training.")
    else:
        print(f"\n⏳ Need {500 - valid_count} more samples. Keep using MockMate!")

    client.close()

if __name__ == '__main__':
    export()
