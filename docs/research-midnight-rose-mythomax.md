# Iterative Research: Midnight Rose and MythoMax LLM models: technical specifications, VRAM requirements, deployment options, comparison with Qwen for roleplay and creative writing, Modal.com compatibility

**Generated:** 2026-01-18T03:26:58.481953
**Model:** gemini-2.5-flash
**Iterations:** 1
**Total Sources:** 72
**Total Queries:** 3
**Stopped By:** min_sources_reached (72 >= 20)

---

## Key Findings

*   Midnight Rose 70B and MythoMax L2 13B are LLMs specifically optimized for roleplaying and creative writing, with Midnight Rose being a larger, Llama 2-based merged model, and MythoMax a 13B Llama 2-based model using an innovative tensor merger strategy.
*   Midnight Rose 70B requires significantly more VRAM, ranging from 14.5 GB for its lowest GGUF quantization (IQ1_S) to 138 GB for FP16, often necessitating multi-GPU setups. MythoMax L2 13B is more accessible, requiring at least 10 GB VRAM for GPTQ and varying from 7.87 GB to 13.18 GB RAM for GGUF CPU inference, depending on quantization.
*   Both models offer local deployment options via `llama.cpp` compatible tools (e.g., Backyard AI for Midnight Rose, Ollama/LM Studio for MythoMax) and API access through providers like OpenRouter (Midnight Rose) and AIMLAPI.com (MythoMax).
*   For roleplay and creative writing, Midnight Rose excels in character consistency, emotional nuance, and lengthy outputs, while MythoMax is praised for narrative coherence, adapting to tones, and respecting NPC personalities.
*   Qwen models, while strong in reasoning and showing good creative writing potential, can be perceived as repetitive or overly censored in some variants, though specific finetunes like "Magnum (Qwen 2 finetune)" and variants like QwQ-32B perform highly in creative benchmarks.
*   Modal.com explicitly supports Qwen models with documented deployment examples using vLLM. There is no direct documentation or specific tutorials for deploying Midnight Rose or MythoMax on Modal.com, implying custom implementation would be required.

## Technical Details

### Midnight Rose LLM
| Aspect | Details | Source |
|---|---|---|
| **Parameters** | 70 Billion (70B), with variants like Rogue Rose V0.2 (103B) and Midnight Miqu 103B. | |
| **Architecture** | Llama 2 foundation, using a "DARE TIES" merge combining `allenai/tulu-2-dpo-70b`, `lizpreciatior/lzlv_70b_fp16_hf`, `dreamgen/opus-v0.5-70b`, and LoRAs (`jondurbin/airoboros-l2-70b-2.2.1-peft`, `dfurman/Llama-2-70B-Instruct-v0.1-peft`). | |
| **Purpose** | Optimized for creative storytelling, roleplaying, narrative coherence, deep character development, consistent world-building, and natural dialogue generation. | |
| **Context Window** | Trained context of 4096 tokens. Recommended max context around 6144 tokens for coherence, with Midnight Miqu 70B/103B variants demonstrating capabilities up to 32K tokens. | |
| **Nature** | Uncensored, offering creative freedom. | |
| **Tensor Type** | FP16. | |

### MythoMax LLM
| Aspect | Details | Source |
|---|---|---|
| **Parameters** | 13 Billion (MythoMax L2 13B). | |
| **Architecture** | Llama 2-based, developed by Gryphe. Uses an "innovative tensor merger strategy" combining MythoLogic-L2 (input layer for understanding) with Huginn (for output processing). | |
| **Purpose** | Tailored for storytelling and roleplaying, generating human-like text, rich descriptions, and engaging in conversational tasks. | |
| **Context Window** | Up to 4096 tokens, with some variants supporting up to 8000 tokens. | |
| **Quantization** | Available in 2, 3, 4, 5, 6, and 8-bit GGUF, GPTQ, and AWQ formats. | |

### VRAM Requirements
| Model | Quantization/Format | VRAM/RAM Required | Source |
|---|---|---|---|
| **Midnight Rose 70B** | IQ1_S (GGUF) | 14.5 GB | |
| | IQ2_XXS (GGUF) | 18.3 GB | |
| | Q2_K_S (GGUF) | 23.6 GB | |
| | Q3_K_M (GGUF) | 33.3 GB | |
| | Q4_K_M (GGUF) | 41.4 GB | |
| | Q5_K_M (GGUF) | 48.8 GB | |
| | Q6_K (GGUF) | 56.6 GB | |
| | Q8_0 (GGUF) | 73.3 GB | |
| | F16 | 138 GB | |
| | EXL2 2.4 bpw | Reportedly fits in single 24 GB GPU. | |
| | General (65B/70B) | Minimum 16 GB, optimal 64 GB (often requires multi-GPU). | |
| **MythoMax L2 13B** | GPTQ | At least 10 GB VRAM. | |
| | Q4/Q5 | 9-12 GB VRAM. | |
| | GGUF (CPU inference) | ~8 GB RAM. | |
| | Q4_K_M (GGUF) | ~7.87 GB RAM. | |
| | Q6_K (GGUF) | ~13.18 GB RAM. | |

### Deployment Options
| Model | Deployment Methods | Details | Source |
|---|---|---|---|
| **Midnight Rose** | Local Deployment | Compatible with `llama.cpp`-based applications like Backyard AI (one-click installation, GPU utilization, lorebooks, author's notes, custom context, local TTS). | |
| | API Access | Available through APIs from providers like OpenRouter. | |
| | Quantized Versions | GGUF and Exl2 formats available on Hugging Face. | |
| **MythoMax** | Local Deployment | Can be run with Ollama, LM Studio, `llama.cpp`, text-generation-webui, LoLLMS Web UI, Faraday.dev, ctransformers, and candle. | |
| | API Access | Available via APIs from providers like AIMLAPI.com. | |
| | Quantized Versions | GGUF, GPTQ, and AWQ formats available on Hugging Face. | |

### Comparison with Qwen for Roleplay and Creative Writing
| Feature/Model | Midnight Rose | MythoMax | Qwen | Source |
|---|---|---|---|---|
| **Roleplay** | Excels in character consistency, emotionally nuanced narratives, handling creative scenarios, and deep character development. | Highly regarded for storytelling and roleplaying, adapts to tones/personalities, consistent/engaging content, better respect for NPC personalities, less eager to advance plot. | While good at reasoning, performance in creative writing can be "alright" but sometimes repetitive. Some variants (e.g., "Magnum", QwQ-32B, Qwen3-235B-A22B) show high performance and strong human preference alignment for role-playing. | |
| **Creative Writing** | Strong creative writing merge, produces lengthy output by default. Midnight Miqu 103B is considered one of the best open models for coherent, long-form creative writing. | Excels in generating human-like text, rich descriptions, and nuanced, contextually rich text. Mythalion (MythoMax + Pygmalion) is highly recommended for writing. | Generally good, but Qwen 2.5's writing quality has been described as "like 7th grade essay level" and "censored beyond belief" by some. Qwen 3 models show improvement. QwQ-32B and Qwen3-235B-A22B score high in benchmarks for creative writing. | |

### Modal.com Compatibility
| Model | Compatibility Status | Details | Source |
|---|---|---|---|
| **Qwen Models** | **Explicitly Supported** | Modal.com provides documented examples and tutorials for running Qwen models (e.g., Qwen 3 4B, Qwen3-8B-FP8, DeepSeek-R1 Distilled Qwen-32B, Qwen2-VL) using vLLM in an OpenAI-compatible mode. Modal handles GPU environments, container management, model weight caching, autoscaling, and API layers. | |
| **Midnight Rose** | **No Direct Documentation** | No specific tutorials or documentation from Modal.com for direct deployment. Theoretically possible through custom implementation using Modal's Python SDK, adapting vLLM, and managing model-specific dependencies within a custom container. | |
| **MythoMax** | **No Direct Documentation** | No specific tutorials or documentation from Modal.com for direct deployment. Theoretically possible through custom implementation, similar to Midnight Rose. | |

## Limitations & Gaps

*   **Modal.com Compatibility Details:** The primary limitation is the lack of explicit, pre-built deployment guides or examples for Midnight Rose and MythoMax models on Modal.com. This means users would need to perform custom implementation, including creating and maintaining custom container images with all necessary libraries (e.g., `transformers`, `accelerate`, quantization-specific libraries) and adapting deployment scripts.
*   **Conflicting Information - EXL2 Quantization for Midnight Rose:** While EXL2 2.4 bpw quants are reported to fit within a single 24 GB GPU for 70B models, some users have experienced issues with lower bit quantizations of EXL2 leading to "uncreative results."
*   **Comprehensive Qwen Roleplay/Creative Writing Nuances:** While general comparisons exist, detailed, direct comparative analysis specifically highlighting the nuanced differences in roleplay and creative writing performance between Midnight Rose, MythoMax, and all Qwen variants (beyond general impressions or specific finetunes) is not extensively available in the provided snippets.
*   **Specific GPU Availability on Modal.com for High VRAM Models:** While Modal provides access to powerful GPUs like A100s, ensuring the exact VRAM configuration needed for very high VRAM requirements of certain Midnight Rose quantizations (e.g., F16 at 138GB) might be a practical consideration or limitation depending on Modal's offerings.
*   **Optimization Challenges for Custom Deployments on Modal.com:** For Midnight Rose and MythoMax on Modal, integrating with optimization tools like vLLM might require specific configurations due to their unique architectures or quantization formats, placing a greater burden on the user for performance and cost-efficiency.

## Source Index
1.  [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGT7xuUEqhhKWg-kTXIwz9F8-Yn2Nf3U0jw2nbUOTVzRXDAyf2qEZnqcrv_osebFzZ2337bliMks3_H1P2SciAgoKGj4cYy3uY2gYiu3zBVqcUbHGPSc-Q94O0brdQqevnzWi7PwS4EYuYAK7XdsiDa0fvfCMwR1sch7ze1DAI_rMonu9jx4aQzLnuh3P_-9I_aV0uvri9xx0B1nxA=) - Discussion and technical overview of LLMs including Midnight Rose and MythoMax.
2.  [dev.to](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHle1tpRDGmPFPKRCGsSh3eRoyuckjM1iDF7MzvWhF-LNg84N0zU9_gXU8DLvGMoJQVrC-YYCHNlkbqVf-p7CIZLHsYa9t6M4NGcr5pQTpoe4qybfYc_mop9pgM4pEo8Mk1oeKjIAw_w49UCzGKKiU4Nmxid8UPacZaPTHTNdAtP0IjJDE=) - Article discussing LLM inference optimization, including quantization.
3.  [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFvE01pNhtpKGVljecEJqRrbcO7GnoZn0GK2M009LZbT60hSnHhFrSY6aU2NRKT2M20AyEaWeqNd0391RDsPrODFonuP__UXtGi6hfzN5wTvJ0_Bc2vfZXfbxjGKoCevRfuc6aCZqB-OjAwfh0WMZ8iMqzuJuKj5qixFQ=) - Hugging Face model card for MythoMax-L2-13B, providing technical details and VRAM.
4.  [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFSgZSrGsmYk53s8WxmAci0yXPQvGo28ZlJQ3oO5cBoJ6Hpm3ZkGj793xVKfTmWM0DR4ls1Xlvu3a1-1YrO3m6F_52ZBh_e7nGdRsHZaOJ3zv7nkKv-ApKPk_XwbxiRlFpumVMpwo4Nt7xFr7iymGOwC2JG3_2afFcwaClsg6m_YNxWiA=) - Discussion about LLMs, including VRAM and performance.
5.  [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHCW8oqeZlqvmn8ywD2oQE6klvupk3fEjuKmyTe7I-r4wgnTKbc7lhWos05PMQhKSXRS1TXsOPiE3XxHItENipFoA9kWUZKj_zDyWsQ_EfRwnIrF7ymMYKvBbzYtCIBIoDgEE5zdstBBGzUNNh45vCE7wFPvWQsGY=) - Hugging Face model card for Midnight Rose 70B, providing technical details.
6.  [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE8gSs95ovWVZRbRaX34HvJII1FaO8ruNoRi8VxyLecjhVS3vnzzozdMi-Ot0pO9zQWL3U4AHT0-yZlvz_zQOWSxadhZXK2wA9ZLS8eF6gHYNJ8F2jFO-COsGhCLzZck-wFs4-rMcMzeLHsnSgP-e_2LjSQEfcmAw0n) - Hugging Face model card for MythoMax-L2-13B, mentioning context window.
7.  [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFIMXIIEsJrAz1s_9FjGVheItS90OAkQA7qrRquaBDWhDTSkks2syAZT2JUnL4WZ6JDO04e2I18FegbKH662s0aBdB_5BzKGO2YwuLAn8rC5F0UZg3gzmfd1Ly2O2oNPBYWcSz886ERNEHgX8xdKgDpl3G9hHwKrRFP32ip5BNtHkoc5jMKfHDoxylS-l06trSd1XG_4E069ntMsw==) - Discussion on Qwen models and their writing quality.
8.  [modal.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEkKzQ6pxjCtRjjyRDEeTYCBHWDjfB88LyCAOo6lv3Dn_BRhaRzBunNalxrROHuYvTHAXTCY_RR20DJxZaVKRonA6w6cQN8Z_pHciatCZJ8qJXVYomoGvuY8T0=) - Modal.com documentation on deploying Qwen models.
9.  [openrouter.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFYtZTAUuSm786juNyVJFWkmkfU0v25PNOpZUnd3OeZBfKcDLhbJjiRThTUwehYjp0tV2xvovTG6Z85e0DMjNHDvbgqVvIvnaRWpAO8skV_qSttXR20X1Gocgvsa-Q2OxtSvCZhYqNEbX4Qer1KQir2mA==) - OpenRouter API listing for Midnight Rose.
10. [aimlapi.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF6-52Ob3iIcr2tes6Ih0l1SPdqvhiXXFDxqpx_2ggkTWVpAewVCIoXkibmU4mfV3u673bVnoAFvNqz8JWz1juujkOJbSXkFmYN-MhbRyUqMxrcWCB2PXfzrJf4Y_K4a_AHoOe_3A==) - AIMLAPI.com listing for MythoMax.
11. [promptlayer.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHGtcx8OFVyweMXibg38OPSc8jyA5FUDkd0S20KIxcH1EpVYgIHFNoi_mONLl7F3FbRcrzIKBbnMATjGnV0Q8aRM6rUE6XlQMITtg56Oxx9HoKkG5mdHs--o67OS24fO4qv7BvL6s5t3FfI7NgWfH0IuKo=) - PromptLayer mention of Midnight Rose as an uncensored model.
12. [hardware-corner.net](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFQXxbXZtaV0mOfQW61KcBMkTuRQJW6Sx3Qnzw9loJHIh_ic2x5yL4cdGB0azazHcVHVas75fjqBciv-QOb361HRzgJ8FWDzuTxcK7vNDdVsuzPdcbHe-4mYX6nu0a0IMP010mdA1Du9C7IqPtTmw==) - Hardware requirements for LLMs, including 70B models.
13. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHSxNpPWabj3oKoaSMynujt_1b-JJ5vwHBuA7fJOXKiLKXRh3RLnKuvF0hkNg953KF8xgZKbbdkYwwVM4wRuxRYshM0gItcfyBv55-orJnLUONoUETviiBG619ckjgdmxQj1GMjD7k9JzV7UEa0QeGNDh8D) - Discussion about MythoMax and its suitability for roleplay.
14. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH9FkYmFTds0_osGogiQnOdgwF7mVM6O8q_t5P4YdA2ociaT1-UCGbV1Pxe9ecYNzDHe4bGwEcw9Z1brac9S5nQvemTOGnr4UPFHEDuvS9lMFq309SUPIOkFoK7--nW39H-SgyaQAHILzgNhZfXtMarxqufmDTH-3YQf7fbtigsrDX4YA3sUb2ClqeY656Vm4k=) - Discussion about Qwen models and their writing quality, including "Magnum".
15. [modal.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGHE0DYQlSpM6jsYl2XbKX8EH1ET-bmHzBf2VBJ1iF9wpWrodaQY55zkjJNlmZ2pXxvImIQIR8QlCUb8A1wmiIBAUUASr5CHtdQCIvzUFAd2eOrIHiF5uLCu8ksJPMHG77IWUpk) - Modal.com overview of LLM deployment.
16. [skywork.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGHmeFA5DF3sj6Bjs4L_st46qFztTLS_XyS0wgTw5BPfKEjim8vxb9bQabBFoZwEeWN7ejmHrgpvkFjid1FP6KFsAiAFoPDUTaDuvRciOUr0rtTtoJiefLvPMffZHMgno_WV-90temeS8S2ePUllR8qrV35d22REqKYjy4OyVYkHtNFw46GHViA91pRFUVLdOgfugAS) - Skywork.ai discussing Qwen3-235B-A22B.
17. [modal.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGckHV6OXoXKHwfhRFeYlXPGbNbvAEOPu4QSUx3UseldpumYhXj55hD6XLRDKRiq9z6J8Tegav6CEw2x8N0oh0qDoRZ89cyN1HDA09aaybUAX1oPDyiw1imvj-fSDC_xlyHkdWGEUwLZrFXciC-ZkjeXaKJ2wKXZzt3bwxWUV1eOTgX7pt0Z_zimannsHZzbrkDmeEVmg1MV6k9H19xPOS8O0Ps-hnOecY=) - Modal.com blog post on running LLMs.

---

## Iteration Summary

### Iteration 1
- Queries: 3
- New Sources: 72

## All Sources

1. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGT7xuUEqhhKWg-kTXIwz9F8-Yn2Nf3U0jw2nbUOTVzRXDAyf2qEZnqcrv_osebFzZ2337bliMks3_H1P2SciAgoKGj4cYy3uY2gYiu3zBVqcUbHGPSc-Q94O0brdQqevnzWi7PwS4EYuYAK7XdsiDa0fvfCMwR1sch7ze1DAI_rMonu9jx4aQzLnuh3P_-9I_aV0uvri9xx0B1nxA=)
2. [dev.to](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHle1tpRDGmPFPKRCGsSh3eRoyuckjM1iDF7MzvWhF-LNg84N0zU9_gXU8DLvGMoJQVrC-YYCHNlkbqVf-p7CIZLHsYa9t6M4NGcr5pQTpoe4qybfYc_mop9pgM4pEo8Mk1oeKjIAw_w49UCzGKKiU4Nmxid8UPacZaPTHTNdAtP0IjJDE=)
3. [hardware-corner.net](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFQXxbXZtaV0mOfQW61KcBMkTuRQJW6Sx3Qnzw9loJHIh_ic2x5yL4cdGB0azazHcVHVas75fjqBciv-QOb361HRzgJ8FWDzuTxcK7vNDdVsuzPdcbHe-4mYX6nu0a0IMP010mdA1Du9C7IqPtTmw==)
4. [github.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGgiVbTIV3mBegvPLKuALvmyn_n2kgRcoFfBG_rzLy8P1aHHWjEWsJLH6AoOR29zVg_OzRYLbB7y2AVxuNab6t8M2DGV7wwd16w0SeiNKRcAJe_on-ADd8cgxmNCvRisEj0njhMZYw02zqqXn1a)
5. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFvHqmU3YC5SK1xhgshWhzKldE5zsGygqdtfPgLhIgXkK7N-yOqkUXBMs6ar4opowWKFqRspxJBJ2B4guZwMAMkPLwU50GJ97Om4bR5okmAKFEkR3NCdXBLhyhGqn9URBUVkzbKec94JaY6BzvJXTN4IRIbCh_-fEkD_X0uvUobtyyXyx-MVdoLkvsgLcDYiwHbvEHbo3s39QAHiJEmZyFc3Q==)
6. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHp_xsfxgUr6cYYfrNoHWcVREag_lFwont8hqoReOiwRivFxF-tKNWPWKWVxRUYq5xmpbmGc9bNrIxf-2AMEvHm4y1E6mkiPJ_X1i9eLJDwK3zftt8fo0rNKPqNus7jqG4y0aG2PNV-SDxP52bbuaVMAQFUx4zMnLfgF_lFi4mSru6_UJxLFXz9UzPFWPfKiEAbOnSWIjqa0z_xY14jquI=)
7. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE8gSs95ovWVZRbRaX34HvJII1FaO8ruNoRi8VxyLecjhVS3vnzzozdMi-Ot0pO9zQWL3U4AHT0-yZlvz_zQOWSxadhZXK2wA9ZLS8eF6gHYNJ8F2jFO-COsGhCLzZck-wFs4-rMcMzeLHsnSgP-e_2LjSQEfcmAw0n)
8. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFNYdlQYvZDBnVlKC0MOCd21sLlP54B0i8Ho7a6be24LQ3BXOwJ4a82T4J0oEC_7h92fh5hR4UrSyJP0YUx_SJ56ua70vJbY2g-roiqDhloZC2DAVghbiDDctKg9D7kLtYzf4RcgBGVcC4MxZYDyMCof7WknghScc82njKji3cy_yqvZQ==)
9. [promptlayer.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHGtcx8OFVyweMXibg38OPSc8jyA5FUDkd0S20KIxcH1EpVYgIHFNoi_mONLl7F3FbRcrzIKBbnMATjGnV0Q8aRM6rUE6XlQMITtg56Oxx9HoKkG5mdHs--o67OS24fO4qv7BvL6s5t3FfI7NgWfH0IuKo=)
10. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF2RPlsMDnQ5MhiK_vZMeOkIZjIGeFGQ1on1n6gLAgTdJt02NgbG0Y9JL_f_40xvWcUKSklTZHFQkTr0nK15cvR2aWsDf_ninDfIBhwCbbvAyYPegbboTqypA6itjJCnk0FKETTIgrOg5fzvOWnA8q6yNBczSuwsdoy-Ey83c_9mEssqOeMh-i_Rny1uup0R2jvb1ESGw==)
11. [hardware-corner.net](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF21aQnfBaa6Nn7gSz4D83lVTl_LqRRc3myWzNobscKgZDfnzmJ7pdXCEWgnCYDN-rRFmDqgUaXaEACgZXYRnaAmQC880IXuKPCWAZxRiD2WwEhi0punbhgGzlx9Se1DsvTetulFSwc4iqnqMOz6w==)
12. [openrouter.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFYtZTAUuSm786juNyVJFWkmkfU0v25PNOpZUnd3OeZBfKcDLhbJjiRThTUwehYjp0tV2xvovTG6Z85e0DMjNHDvbgqVvIvnaRWpAO8skV_qSttXR20X1Gocgvsa-Q2OxtSvCZhYqNEbX4Qer1KQir2mA==)
13. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEe_4UyTb_erOmK0CFtKKwxWK3kis-1Cpb526Pa7IWaDOH5-ibNVsU7seFTTnUGJOzFs-gUmFU4N2d3G5v-bxGo6bK4waD_0ZNKaT-V9KBveAaLIJ1XutFh1X6DlUyCOkK__B9jG3Jg5t1F28qgbXs=)
14. [modal.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGcdpKF3aHRkyTGFR02WyQqYtOGLf7EcvT_C9CgkJTuWG-nWsM_CTTBfRhZwqt9FuErx8pMzLyW36q0swPNIXRaGAPeIs7aUkgmF1qlfHhUzrwknJqi4Eg4J19PS5_VrKMUZg==)
15. [dataloop.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEvU9rC9R7c8mqgvRUlWW1Ffdxrw48kIZSjz0aXdsbzaMOznKbEPIaXqG5BinnjhyRpEdU6_FtNlc6Dj0u8Y2UNeOHQOXHpmyEUsAntjwxCU5aCP1tKHYYKj8e2DEQe4ymmNskLBEzXOYL-s59zWxfGPPtwHAsXQ07bZJf42RKmlwXtruFI)
16. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFhVZEJOk2IdCRpWlLiDgwOnMUBFxEUCQnkpyjXDKSXmOnUXrcZi_GQ0DoJofsFeKrjDKwwPfi7JZjcZ1QfSNwgW2UnOg_eDoFLmTnnGZujv_Gu3danMJM9PnSLLZ49pXNrGVKJC3pB0Tit7bbzfzxYivAtHm3HIOeKMWia1sdBHkOyW4zdIBhTpJCCiiE0fRKNifVmJm8LixJLyGVCuw==)
17. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFvE01pNhtpKGVljecEJqRrbcO7GnoZn0GK2M009LZbT60hSnHhFrSY6aU2NRKT2M20AyEaWeqNd0391RDsPrODFonuP__UXtGi6hfzN5wTvJ0_Bc2vfZXfbxjGKoCevRfuc6aCZqB-OjAwfh0WMZ8iMqzuJuKj5qixFQ==)
18. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHsCPYc5Y86lQa7_YnqclUipOFOzbVRqjofiwGUVaxJpj0_DM2_WFrPVGCQFLhI3wclqZdaxjd7NAB5oaGyG6WN3c-ZKZJIbgTa9btfKN41XPv-1CIW0_1u6pAL0OLOLIOKagdqDWe_nE-S-rZ_69mtGbRlSkdo3nB90qMZLtqfG6_1ErxhpTQWK9rSCxD_yV1xOjAIzg==)
19. [promptlayer.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHQcs48ns1W333e-tNwk9B-xekaU3yZp052sOLgnUa_AEi9piVepFyHD-rr7WlCHHmMnAxThcReDtuXW6b3qilEiv-pZ4bIUvQOvTHZPiQ8_1Odp1_U3ur6MQTA4G0epMuTgsULWAGBm1ThmfaZpz3Awf4gMQ==)
20. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHSxNpPWabj3oKoaSMynujt_1b-JJ5vwHBuA7fJOXKiLKXRh3RLnKuvF0hkNg953KF8xgZKbbdkYwwVM4wRuxRYshM0gItcfyBv55-orJnLUONoUETviiBG619ckjgdmxQj1GMjD7k9JzV7UEa0QeGNDh8D)
21. [hyperstack.cloud](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFVu_-yIja97IkDgAwlXBx4I6qketJQf46ZgXHGAkisBAdyGI3Shklhq9OCvQdRk96jO2m9u9UBF1yrOsjFPdgh7FrMhltl6-k6it6KRKQnBlOaDfUkf5tykMBC7TWEkBfBcMxzEvNmBPwy8DhZhUs2qfWVzCIeaauexjzKzPjdiY5Kv6z3nDLBBg==)
22. [skywork.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHbqW7Lqx-9vca15YJIBwRkI_R8FuRxIlT-YqeVCz-9sFEScD6ItP76vOwarLgWOG28Cge6h9nnZ6PNeb_HIlhjl9JmjeIgNEjoTHoPqAmczdiQnk5RH5eU74jf1jZgxndQ5GhhR9ySkqu4YSdCJJ9S8YDUmdsgkleaX82iOviL_8BPDMW4_H0NSRsJOCUWiLEZAAg=)
23. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHJ6FOdJeVz29jHEoHicaRnRJaoUbMUIFNgVMvtfUStdNM9v-5lZT2tx2v9KvcO2wJXPTs1V6mWuxNL-cLowVAf7_CY_6va_PLW6jDwJA7pSWAdUwGNqIf1dvGAxdYPWK18kgQRbw1XM4YbvOYrEbmZrP_pg7P3J3a_SCH2LH4m0wv4uy3lc2f7vj_TDmgR365O1dBtSDtWzsj74nzdhl4QuA==)
24. [modal.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEkKzQ6pxjCtRjjyRDEeTYCBHWDjfB88LyCAOo6lv3Dn_BRhaRzBunNalxrROHuYvTHAXTCY_RR20DJxZaVKRonA6w6cQN8Z_pHciatCZJ8qJXVYomoGvuY8T0=)
25. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGvH3z0R4NBbQIVvmDH0j_W16KsBhwE2xVnaGCRe4VwV7KckO_CgzV3uCkfqfrznLiXDbO_s_Fk8A1k63woklw0lwQQfG4cCslT2dyGA0AchFR-PTANuwKmhZX3EXrNKvZiyCIoHHwfzM3O5K4HDICD4pPpZNYjsX5VhsodAK-QeZqhFz5wjtezlaoTeBMSgUM4SMeZ)
26. [aimlapi.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF6-52Ob3iIcr2tes6Ih0l1SPdqvhiXXFDxqpx_2ggkTWVpAewVCIoXkibmU4mfV3u673bVnoAFvNqz8JWz1juujkOJbSXkFmYN-MhbRyUqMxrcWCB2PXfzrJf4Y_K4a_AHoOe_3A==)
27. [writingmate.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF-5uVMaCJchd3mKncwIWSkg2oOqHf5G-mkqY7hQv7DEVtbZ9m1mU9NP-Luyh4BQnloYYJ7HJEh5zsHBmTc4FlcEjsuy02iVaMTXgMhVsPMoC_-crkGH9ccstGFGoFzBYZamIsZXY2YYgO3Cv1etLZgoQaXv8-3wa9kSg==)
28. [youtube.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFJO02F6LQ3q94WjmxfaF0GheA4myRX9y8TxwzHRyYtqBXRQNNxd-6z1zBct1nTk2TOnGYKiHqxQKz5Qn48jpJ8_73AyyN3clh0M7m_YloTTCXSLude0El7wTrVuk55oQQ2_ciMIbc=)
29. [modal.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE5zmiLy1yPBV9QOSbPdaNhK19LRnqhfVoWZktxJZYPFXh9K2HTfGwRb2Wm0ZtFcNE8f6PabEMAZuynRzRDenWP0Ymcnmghebei4zYiQSL1N9mE0Oos4P7mpzBnmtDZblnS36rLbWlNB-dLALr2JuOf9JI0g50yYQ==)
30. [straico.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFz4bpUUunGZdpel7--HzwjifLerbz1g7wBmjYzR8PMi3TNihBpBPzruZYX8_GUcugCDVfQYZUIGUjOV3omg0tRyylTEZNQgts2EW7kFop_yk5T4NLzCp5gbUGUrd2kgR3akqe2B9q9jX_3afZgQlc=)
31. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGaozU40bRV8jZzObe6bmIRksUj8QQTrlEVm8zcVt7OHcHTe4rVVTPpanKwvE0_Z3ir1uMRjKJ48Gu4-tKfpaHh-wUHi2EwLIrwTAgYs_Tjo40M3rhyrge0tNJpfSnKj8vjxHWKqS5oaUJuV-prrKwF-Zz8uL-7QmBwMgKvnFye7eyofXRMORbOUul7tqa8woKA2SMuZR1hyrU=)
32. [siliconflow.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFZbOgSjLFD_PICqCRQZYIZ6MPYHpNBKdYTF0mWLoolPJtMrUmbd1annYjrSehdPIqBc8ijUf-LuHSip0bgSiPMqjrd_kEZD2X-68LW2OsOV_FqASlEEDHHg613AIlm7Xr2oke95ej3ZGN8KT_PCdjoCIJIyJkCB9xPOTqvyrACS1bryPjytSknwYV6b-CChBKtlV_s5A==)
33. [novita.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE8LKHCEkia2aNyML390afO8ojYcXUN81bPEcZ38RnRmN1HawaISvapRS_B_Qj98m9ecBKcdMXDZRWdfnKmqGPED7gEd4a7anj08mAoI4aEUdLKRtSOBXip7kSgsZO88BCu2q0QjYB0sGJIoiUPWEvIsYbCgEh9TTRwOdmkiYkf)
34. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHCW8oqeZlqvmn8ywD2oQE6klvupk3fEjuKmyTe7I-r4wgnTKbc7lhWos05PMaAhKSXRS5TXsOPiE3XxHItENipFoA9kWUZKj_zDyWsQ_EfRwnIrF7ymMYKvBbzYtCIBIoDgEE5zdstBBGzUNNh45vCE7wFPvWQsGY=)
35. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFIMXIIEsJrAz1s_9FjGVheItS90OAkQA7qrRquaBDWhDTSkks2syAZT2JUnL4WZ6JDO04e2I18FegbKH662s0aBdB_5BzKGO2YwuLAn8rC5F0UZg3gzmfd1Ly2O2oNPBYWcSz886ERNEHgX8xdKgDpl3G9hHwKrRFP32ip5BNtHkoc5jMKfHDoxylS-l06trSd1XG_4E069ntMsw==)
36. [promptlayer.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGvkS4RrU3rGenNNxs1nZO1uLc0yf1LXC3n8w8288A1RpMDJYgnzdhyAdPBC6uDyO_OyELBbqXxTDmWoggyXlSo7mOa11Er0Qx8OHBp3agzvVTsE7HlWDUL-1vgaKXPK0Ch7RNm)
37. [anakin.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFBSUmJQmgJeJeALz6i-7PoqaOEhhKE-8QqXP5vOOO9fbgsO8kDw6E1vDz36HPh5mK1gcQKMeCfvoUPL_Z0eClHb_Yg29lMJ5C43QTOouBkWvtWAPFwxk11SL3n7aQvq4B6SYmQB3ZRTg==)
38. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQE2KT2t5wbFR_N_84OzX8MLFpkZKdkVz_z3KdWNKMntl9w1Eo5_j3I8g5wezLKQhd7WSKhKIq03U2adjbYneBvrkU5sEHaX6QARzezTKXZBefPwWIGEWDjqTFdhpTjndqnhGWAF1vHF1CSIbEr5tFKT8GTjXKj9PnYASL7wa2OhFYB-ctmnlWIOeLSS9opJdFq2TMUhXBH7lFKSN2U=)
39. [modal.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGHE0DYQlSpM6jsYl2XbKX8EH1ET-bmHzBf2VBJ1iF9wpWrodaQY55zkjJNlmZ2pXxvImIQIR8QlCUb8A1wmiIBAUUASr5CHtdQCIvzUFAd2eOrIHiF5uLCu8ksJPMHG77IWUpk)
40. [relevanceai.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEDTNu29e_euqc3PZG12w8NgPXDEyPSy3uZPlple4ZIB1S6Ht-UD0s1Fn4yXTMzrr49fNXsvgpmcSou9lo4R58U8Mgcx2c73fqxRsui4zJhybU-F8JblZqDcdUiul4AVySGx5Xw4XWOlzcSL3Ia9sMSOjvTLK-K0JfG-gHsHo78-nzJcYM6B3c82aK0BnrhGAWOVumBNNJWacZVMjw_)
41. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFSgZSrGsmYk53s8WxmAci0yXPQvGo28ZlJQ3oO5cBoJ6Hpm3ZkGj793xVKfTmWM0DR4ls1Xlvu3a1-1YrO3m6F_52ZBh_e7nGdRsHZaOJ3zv7nkKv-ApKPk_XwbxiRlFpumVMpwo4Nt7xFr7iymGOwC2JG3_2afFcwaClsg6m_YNxWiA==)
42. [modal.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGwplolooF1DnlSbKJeVkWx5d3qtOMG4hWDG8QXMf6_27IBy45CMJtJZpx-o1YJ-YyAiqg_1hP8T9ep7oGhm5w0hX9_Rs32iimZpzMcLNkezPwCsx2PbRFhxnoDG8tBx9UtHQhgK4NrsQ==)
43. [medium.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGckHV6OXoXKHwfhRFeYlXPGbNbvAEOPu4QSUx3UseldpumYhXj55hD6XLRDKRiq9z6J8Tegav6CEw2x8N0oh0qDoRZ89cyN1HDA09aaybUAX1oPDyiw1imvj-fSDC_xlyHkdWGEUwLZrFXciC-ZkjeXaKJ2wKXZzt3bwxWUV1eOTgX7pt0Z_zimannsHZzbrkDmeEVmg1MV6k9H19xPOS8O0Ps-hnOecY=)
44. [openrouter.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEJp-dnjQbxuj1IVZvvQ2MjrjYdCYBU6ya7oWMiggHX9JwNz-pb1RKYxpeXKL588dnc7rPS2MefoNIopQsSmDGLjyXPwNVnPVfQy7vsVg_QasWamccB1BLKyuDHC0VnqI2338D1Z4wKrjanpHv2uJIJ--M=)
45. [promptlayer.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFgNU3zHiAhpvQNQ4qFJdeCjYfQ14vrCLIvVAvf37oNjse2EYYc8q7mU3OTUBzfdcPAF3T1qkJl-st5p2RCQw4o7_QhnXY5XqgB-sjRvdoOXcnCXfKXwBxzNAk-HIEymtK734_ohg==)
46. [upend.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFuOoAFCXtrpsu03IWPtdHPi_5o24xm3hmNGAysbaB3eUzX0-STUBOZRGgssmSD9_oNjACH-OOaiqdAN_vHb0bsHDuoqzdP2e08BWczfq3FTdndyW49zpRkiVV2)
47. [aimlapi.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH6KdZHTzji6KUN2hzWwlzhIbolI4JyGhBoFBxYWKhHl6ahv29nnN2KulV_AUfrrPtqH3F_5MWE8BbybvG-XKGLPEAqSa1bQgPwOdgWF9fsi9vrgD8N2niiIW81m5lCZAcCtgLl)
48. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH9FkYmFTds0_osGogiQnOdgwF7mVM6O8q_t5P4YdA2ociaT1-UCGbV1Pxe9ecYNzDHe4bGwEcw9Z1brac9S5nQvemTOGnr4UPFHEDuvS9lMFq309SUPIOkFoK7--nW39H-SgyaQAHILzgNhZfXtMarxqufmDTH-3YQf7fbtigsrDX4YA3sUb2ClqeY656Vm4k=)
49. [youtube.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG6BOKKAZx8-ytGhBJGgCImsB5bcs1k0zEPsKygKb_cbrGquIVrMNGtZbwvpI_NTHlHRJzwuqIVEH4tgWInRX2drwlzOr8FfFPLyRHGFhJgp8512-4eU7YQ2gI16JW_mzy13TL1WfQ=)
50. [skywork.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGHmeFA5DF3sj6Bjs4L_st46qFztTLS_XyS0wgTw5BPfKEjim8vxb9bQabBFoZwEeWN7ejmHrgpvkFjid1FP6KFsAiAFoPDUTaDuvRciOUr0rtTtoJiefLvPMffZHMgno_WV-90temeS8S2ePUllR8qrV35d22REqKYjy4OyVYkHtNFw46GHViA91pRFUVLdOgfugAS)
51. [dataloop.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGmvBbVNLusd6b8C0fjLlnUgOqJ7d0ERAq1U4CumODki2ujBbu5lQQUK38xmxxZvfVmaFIBkENhYhkREwebsbD1MKwZAZY3SLxmhn_LaiL6mqZIiSICSOlUbAOGrJG7q6MHe4JAdf75qemqiQhg63K6Yp9XfDO6iODwXOQNLaR5SUbN1EY=)
52. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGD2xuL7Hx0nVpMyNRX-oUtHYEYJCNiO7ZgB8PASABQXyYGgh6SbnfHoEcqCT14a8Ytj1hqNonW2xj3JHnUXpqrUr77sIEKaCdc6kYP59ZQkWh42AVpVlUUFc-3Oh8WaucZMcKHyTmFJfBazPOOJXk=)
53. [novita.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHdJaEqmD8oW2_1gVhY8rcc44eV5VOir5K9IsxWgSeqCOdD9CUU4jOdiMWywli3Mt1WSxEvCYpYw2YBOo8kux2rN8ThdbrYfHN38jrQV4YeVoBbdGJ2CJm0m8jKmfIt9N7-Ds8QY72AyEtJeJInryO8utfa9vfFnom_QWp0eHA=)
54. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH0P43dkKED55W0T7QaaFFpKf95KpOoK7QKGzRdG26wIXxpflds4MoQOrJuvhE2DS3Wgc7uhzaFrzb5crrJOrdLv_zbp7e06YeGs_hrmrOfS_-ods3yef5Fmj8_kWHUcBT5m6XKFvqrb1OVmvdaPXv_WaUvRb_chw4IhrNEo0Y1DmaOMvobMebKcO5p8g==)
55. [straico.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEhq-mznQtixKKlJyLO0ea_yI_lUZXe3pS_AcJ81fEd7eVl-RQ4zCRgtk8Fi2tm-CXbeduLMQ9s-Hu7eP2HNmHEomOJLoB3PcA0l12LKW4M0IXfWl7LO7DJ6xCWU7D24eIKI6ej_lR0POndUkrACg==)
56. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEybputOdQ__JF5h8mTF99iPsZFBRNWDGZ4EXyemohE9Avnvc1aNbLbzriajBzKoh7QxG5TvqT-4MtXWvJhTu547NY0lPJJJGWfyx2A6cQlFsHpOabRAEKEYhmRuRW0PObEDTHO5VGPRVhChKPnhs266tramDCMNhVYYZqdPnJnL2L2Qp0dQL8izi2c0fec5VME_vqQNGJiJL0f5Wm9)
57. [dataloop.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFQdkS0maGYjlNVsp-2CV9sR3Ed-4S6jkNneqNbG0IYWigipzZ9p4GLiWFoL1JeofohzPZIQcTImv9RdY7r6C0EaQ9_BVrG61TIhD9cxYjhdegF3h-e97TGxdocPVPBVY7iWqazv2k_RduwXF8tQ9b26frOyW4BhsKQvx8=)
58. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHzS_jAQ-Zu95TDyj5Vrlp9DzkOJ2TEq1sooPFOJRlxZL4vD7Jd8UQiM9rvVq67mlrYCzMsp8mesJQ5_nkPNKwFIKOh2nKXB3oQtjCZRYXHxVMjURlttAbPXdyAvvtbZ4wQn88jPo9vwzNm167h-1IBfZYHSNOhPg==)
59. [fireworks.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG70s62iGI_2ogldurgB5QmclwGGg4QlneqDy5ASXD-3yyl8BArPjapEjvQDr-Fa-83wJ702AcoJCapndUupVBj5iKXfgijkjE72xDgWMlr635SSuIoXPg2zAlyWMRGUH1Tv2aI7B3ETCqQ--OIWFE_)
60. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGGRT4ldWIFjMX9_0VCATKxQyCAuOU2nrSP52p3kmuK8EQMKjD8P0DkY861yHVSM7cMeKPqIRXSto34RJg_WGu3PxfB15GbAttIJLzJnWsIv5zkV-CeGehXJ33QjcH16E6oe88p4Whf1Pjisw9tLxIWdJREp2t8xv2ZclYyFSFtHHNWkTUQNNnMB2ZVwezEPMtSxafZ)
61. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFpWw0qpM-n1qR4t8eeVX26gb36FtNUdjNyc-14RbzbjPs0S0g1e6atoWveUZHjjP9jGhh9xLJU-AOCNehaMsWLFRyWM2E8HPceIl9mtoxLLWU2U2ovFjoTQH3734bvVLRo71bOk2C4P6lqy3e9zw==)
62. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQElk9KoL99gKbHfvzrjxhOcMrzUiuP2rTxe-KfNCzfZYIvMn_EOyWH4lHHZIkf3APaB4Vlv_r22Chs424pQt8jRrS3fv-rA40tg70gv2r3HzgOfZIuN-b7Zjs3NR5zE3IuYHBewIQ-1MNgEu-kjYJOtXU8uN6FND8s=)
63. [getmaxim.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFt31nYLtdVrcn5d5hfH1z9TrAx-kBMkbMdVcx1PjvR2z1S4DBq8BHeVUHccYDeILihDI0C1-o7jd-t2VXpA6X4fdSc9tuEy1E9VOq_f6un6uKtCoRAhfTBcaMZ5G5CA7BdqyxT5uPWFID-9NCEpM7tJ8Q6eYUqA6uikAjaC0qDf7llJnd9ZX6OiJ3GtOkForKmxtNC4pOj)
64. [reddit.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH7iT6FvcrSycJmbMJsKVh76H5NSW5MG7m_Rb18B2vlrwQdPLkpBFa9CIs2eSXczzcsWP4b0ZEs3bgI65G2UxHJn7dfJXCd478c6M8w_sxPzf0h5UXr-qqTgvGRopd0UfKHKskLSxKVP81Dd4xZR7-Co4_fpUqfk0-Fp5tFd3GYvZ73KRnUS5dMLXOeOWqF-DvpyYubEP9xeqgCfK5TyJEt)
65. [brianonai.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEKmlHX4yNUB7mPE5gFSw5Ucg6qQydI3EsocrXTJL5q0YqbOO_yyRBNLq3ilgkWA-bHbxtZIJd28I7GBmCYvARLoVSzix71Y1D4Wp0r_DBIdBi3Z7jTjRmhJJVAYw-xjZFNWsLtolC4zPoD8o7ziQ==)
66. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEhZmOSTUwdV138YTiNt8m052fGeN5wppIjq6PA4PVJt55J2Dlb3yAx8mKJ-oUVVvFnNYp8ctXTP0qYlh1QPI1doxYd8PTHvmf4-7Y9sWNLqg4RxMe9bITW6edl7BgB_WybGTHfqioZAL__BLItSYY=)
67. [localllm.in](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHCeIyi7rQH7J1BQU7dyHwmRf_5useLjYIFneCxicSHwQoBMR9J2BOKy3XKNrewADljl0q9QQyu9a97u3w73opicIHMJz5Z6Rq5YIFqCOFh7NsRCpL86IqTec2tBjk-pLcW4MeVH9Ctrem3nkQ9utYgEiQYIWTibixoeywAww==)
68. [medium.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFA8rLUtOv399amHJkRgwD8rkKLt_NXtcdsbaVhLL-jTRp5VXlkhj0ALEiVdqOVu9dwc2-vqETrP00cG5n0HfelBS21X-wcQeg1DjuRBW1s9Z60c4hLYCDoJhDGilA10d-RirKE__eutdAvO9SpqQ-kxxmzBMRgtzsj)
69. [dataloop.ai](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFgmbMsWGOg5oFkM4hc3c5G15dyL5kTImji7ihUeLJdgwgZK1jiFn1k_DLJZ67dEoTG2bJVbHSGWQdTBgYrpcpeKUnrZfBNfe3aBInoAzzRD8PGjPrErHvCk2UKbath3EYwmI43FkgAwmADqkZ8ZhgKGvyC6BkYjfHfrCHVCc5t9rej5yDl)
70. [huggingface.co](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGrl7W2feamK-mBixpKB6KB5ySO9A0W6jFn2ZPKvHEztJ1NeBtsmfhkVdlhe-QUNeiGlH0f9Aq-crCo_v1KtOhMv1-XKMD9Atr6Ku841lazdJULUthJN53w9OeG2me1PVrcfGcwov1nDK2PMPcS_5GKI4cq247vOni4sg==)
71. [arsturn.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFDdV3ghGcR5WoYjhmzt7YVlZ7c-cRIanbWFrXz5gVeRf7a9kpwtiIuM7DHxvVasPIGnoIdmOukicQ6MSXeTU2a39pMb5I7j1AuPOq7InO3WH0bNDne1HIVMZLpaewGe1Jv38aL801nLNjREE157fophYaTB-p_R2zJ-zFxU5sDhIrqoXiX_6OstxXf)
72. [modal.com](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF1hDOtmBJT54PctgKObz5aT_EqSJ0EbDpAMkwvYhQudr2_in3siTf4OHcXXqx51yxq2Lgw8dfpgMXqHUlQ8Y-Sxoc04b-SaTDvs-CvYazcPhvyekeqTV1qzZ-YuBDJk3x-WTKiPQYH96JOt5En0_w=)
