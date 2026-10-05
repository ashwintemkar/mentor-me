"""Fine-tunes a small open model on a mentor's own past code-review comments,
using Tinker (https://tinker-docs.thinkingmachines.ai), so review feedback
matches that mentor's voice instead of a generic LLM tone.

The five examples in review_examples.jsonl are a starter sample — swap them
for your own real review history for a genuinely personalized result.

Usage:
    pip install -r requirements.txt
    export TINKER_API_KEY=...
    python train.py
"""

import asyncio
import json

import tinker
from tinker import types

BASE_MODEL = "meta-llama/Llama-3.1-8B-Instruct"
DATA_PATH = "review_examples.jsonl"
CHECKPOINT_NAME = "mentor-style-v1"


def load_examples(path):
    with open(path, "r", encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


async def main():
    service_client = tinker.ServiceClient()
    training_client = service_client.create_lora_training_client(
        base_model=BASE_MODEL, rank=16
    )
    tokenizer = training_client.get_tokenizer()

    examples = load_examples(DATA_PATH)
    data = []
    for ex in examples:
        prompt_tokens = tokenizer.encode(ex["prompt"])
        completion_tokens = tokenizer.encode(ex["completion"])
        full_sequence = prompt_tokens + completion_tokens
        n_prefix = len(prompt_tokens) - 1
        data.append(
            types.Datum(
                input=types.ModelInput.from_ints(full_sequence[:-1]),
                loss_fn_inputs={
                    "weights": [0.0] * n_prefix + [1.0] * len(completion_tokens),
                    "target_tokens": full_sequence[1:],
                },
            )
        )

    print(f"Training on {len(data)} examples of the mentor's own review comments...")
    await training_client.forward_backward_async(data=data, loss_fn="cross_entropy")
    await training_client.optim_step_async(types.AdamParams(learning_rate=1e-4))

    checkpoint = await training_client.save_weights_for_sampler_async(
        name=CHECKPOINT_NAME
    )
    print(f"Saved fine-tuned checkpoint: {checkpoint.path}")
    print("Pass this path to compare.py to see base vs. fine-tuned output side by side.")


if __name__ == "__main__":
    asyncio.run(main())
