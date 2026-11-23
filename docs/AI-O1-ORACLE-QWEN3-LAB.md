# AI-O1 — Oracle AI performance lab (isolated / not installed)

**Status on 2026-11-23: PREPARED; Oracle deployment NOT EXECUTED.**

Founder goal: install a small self-hosted AI model on an **Oracle Always Free Ampere A1** instance to test response speed before any LocalEats product integration. Later visualize measurements in a founder-only **Super Admin → AI Lab**. Explicitly do **not** connect the model to the production LocalEats API or Customer/Merchant/Rider apps at this stage.

## Chosen candidate and resource ceiling

- Model: **Qwen3 1.7B**, official **Q4_K_M** GGUF (1.28 GB).
- Runtime: **llama.cpp** on Linux ARM64, CPU only, localhost inference service.
- Current Oracle Always Free target: up to **2 Ampere A1 OCPUs and 12 GB RAM total**, subject to remaining account allowance and regional availability. Older 4 OCPU/24 GB guides are obsolete for Always Free accounts. Verify your billing eligibility before launching. No GPU is provisioned.
- Expected OS: Ubuntu ARM64 on VM.Standard.A1.Flex. If the actual Oracle VM uses Oracle Linux/x86_64 or a different shape, do not apply an Ubuntu ARM64 script until adapted.

## No-account-access gate

No Oracle Cloud/SSH connection is available to this ChatGPT session. No VM was inventoried, created, modified, started, or installed; no speed or resource results were obtained. No credentials belong in this repository or chat.

A local install + benchmark package was prepared separately in the founder's ChatGPT conversation for manual use on a verified Ubuntu ARM64 VM. Package scripts:
- `install_ubuntu_arm64.sh`: checks ARM64/Ubuntu/free disk, installs local build prerequisites, builds llama.cpp, downloads the official Q4_K_M file, verifies SHA256 `d2387ca2dbfee2ffabce7120d3770dadca0b293052bc2f0e138fdc940d9bc7b5`. It does NOT automatically start the model.
- `run_private.sh`: starts `llama-server` on **127.0.0.1:8080 only**, 2 CPU threads, one request-processing slot and 2048-token context. Do NOT open port 8080 in OCI security lists, firewalls or Docker.
- `benchmark.py`: only permits localhost, uses synthetic takeaway-shop support prompts and captures streaming time to first token, end-to-end median/95th-percentile latency, failures and concurrency 1 versus 2; never uses real order/customer data. Report emitted to local JSON. Model-token/sec can also be independently measured with llama-bench.

## First verified Oracle run

1. In the Oracle console verify the account's Free Tier shape, home region, available OCPUs/RAM, OS and whether there is already a VM. Do not select a paid instance without a separate explicit decision.
2. Connect to the VM with **your own private SSH credentials** (never paste them to ChatGPT, GitHub or a public URL).
3. Review and run the prepared install script on that VM, not on a GitHub runner or production host. No public inference port.
4. In separate SSH terminals launch the local service and run the benchmark. Record CPU/RAM, exact llama.cpp commit, model file checksum, p50/p95 latency, time to first token, output speed from llama-bench, and concurrency slowdown.
5. Evaluate whether it answers real-world *fictional* English / South African takeaway FAQs without unsafe inaccuracies. A fast but incorrect model is not ready.

**Zero measurements have been obtained so far.** Do not invent a speed figure or show demo numbers as real.

## Safe Super Admin roadmap

**AI-O1:** private Oracle server and synthetic benchmark; no LocalEats API connection.

**AI-O2:** a protected, preview-only Super Admin performance screen that can import a benchmark JSON report and visibly label imported vs measured-live results. Its data stays synthetic and it cannot change shop/order state. Don't wire it into the deployed Super Admin yet.

**AI-O3 (separately approved):** a founder-authenticated, rate-limited **AI-lab-specific bridge** to private Oracle (e.g., Cloudflare Access/Tunnel or restricted VPN), with server-side authorization, logs, request caps, short timeouts and no secrets in the browser. Not the existing LocalEats business API. Ensure it cannot become a publicly exposed chat endpoint. Never modify order prices, states, payments, rider access, notifications, refunds or merchant approvals via AI.

## Evidence and references

- Oracle Free Tier constraints: https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm
- Official model: https://huggingface.co/ggml-org/Qwen3-1.7B-GGUF/blob/main/Qwen3-1.7B-Q4_K_M.gguf
- llama.cpp ARM64 build: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- llama.cpp server: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- Prompt/decode speed: https://github.com/ggml-org/llama.cpp/blob/master/tools/llama-bench/README.md

**Production invariants:** No `main` changes, no production deployment, no modified Firebase/Supabase/R2/FCM, no real shop/customer data, no background operation. This document alone does not provide SSH or Oracle access.
