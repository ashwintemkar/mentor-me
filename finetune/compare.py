"""Samples the same code-review prompt from the base model and from the
mentor-style fine-tuned checkpoint, side by side.

Usage:
    export TINKER_API_KEY=...
    python compare.py <checkpoint-path-from-train.py>
"""

import asyncio
import sys

import tinker
from tinker import types

BASE_MODEL = "meta-llama/Llama-3.1-8B-Instruct"

SAMPLE_PROMPT = (
    "Review this code:\n\n"
    "function getTotal(items) {\n"
    "  let total = 0;\n"
    "  for (let i = 0; i < items.length; i++) {\n"
    "    total = total + items[i].price;\n"
    "  }\n"
    "  return total;\n"
    "}"
)


async def sample(service_client, tokenizer, label, **sampling_client_kwargs):
    sampling_client = service_client.create_sampling_client(**sampling_client_kwargs)
    prompt_tokens = tokenizer.encode(SAMPLE_PROMPT)
    result = await sampling_client.sample_async(
        prompt=types.ModelInput.from_ints(prompt_tokens),
        sampling_params=types.SamplingParams(max_tokens=150, temperature=0.7),
    )
    print(f"\n--- {label} ---\n{result.text}")


async def main():
    checkpoint_path = sys.argv[1] if len(sys.argv) > 1 else None
    if not checkpoint_path:
        print("Usage: python compare.py <checkpoint-path-from-train.py>")
        return

    service_client = tinker.ServiceClient()
    tokenizer = service_client.create_lora_training_client(
        base_model=BASE_MODEL, rank=16
    ).get_tokenizer()

    await sample(service_client, tokenizer, "Base model", base_model=BASE_MODEL)
    await sample(service_client, tokenizer, "Fine-tuned on mentor's style", model_path=checkpoint_path)


if __name__ == "__main__":
    asyncio.run(main())
