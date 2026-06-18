"""
run.py
======
HabitaData DF — Lançador Unificado da Aplicação.

Execução:
    python run.py

O que este script faz:
  1. Verifica pré-requisitos (.env, banco de dados, node_modules)
  2. Libera as portas 8000 e 3000 (encerra processos conflitantes)
  3. Sobe o backend FastAPI (Uvicorn) em subprocess
  4. Aguarda o backend estar pronto (poll em /api/health)
  5. Sobe o frontend Next.js (npm run dev) em subprocess
  6. Abre o browser em http://localhost:3000
  7. Exibe logs de ambos os processos com prefixo colorido no terminal
  8. Encerra tudo limpo ao pressionar Ctrl+C

Requisitos:
  - Python 3.9+ com o virtualenv ativado (.venv_mac)
  - Node.js instalado com npm
  - Arquivo .env com OPENROUTER_API_KEY
"""

import os
import re
import signal
import subprocess
import sys
import time
import urllib.request
import urllib.error
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------

ROOT      = Path(__file__).parent
FRONTEND  = ROOT / "frontend"
VENV_BIN  = ROOT / ".venv_mac" / "bin"
DB_FILE   = ROOT / "habitadata_df.db"
ENV_FILE  = ROOT / ".env"

BACKEND_PORT  = 8000
FRONTEND_PORT = 3000
BACKEND_URL   = f"http://127.0.0.1:{BACKEND_PORT}"
FRONTEND_URL  = f"http://localhost:{FRONTEND_PORT}"

# Resolve o Python e uvicorn do virtualenv
PYTHON   = str(VENV_BIN / "python")   if (VENV_BIN / "python").exists()   else sys.executable
UVICORN  = str(VENV_BIN / "uvicorn")  if (VENV_BIN / "uvicorn").exists()  else "uvicorn"

# ---------------------------------------------------------------------------
# Códigos ANSI para log colorido
# ---------------------------------------------------------------------------

RESET  = "\033[0m"
BOLD   = "\033[1m"
GREEN  = "\033[32m"
CYAN   = "\033[36m"
YELLOW = "\033[33m"
RED    = "\033[31m"
DIM    = "\033[2m"

def _log(prefix: str, color: str, msg: str) -> None:
    print(f"{color}{BOLD}[{prefix}]{RESET} {msg}")

def info(msg: str)    -> None: _log("INFO",     GREEN,  msg)
def warn(msg: str)    -> None: _log("AVISO",    YELLOW, msg)
def error(msg: str)   -> None: _log("ERRO",     RED,    msg)
def backend(msg: str) -> None: _log("BACKEND",  CYAN,   msg)
def frontend(msg: str)-> None: _log("FRONTEND", GREEN,  msg)

# ---------------------------------------------------------------------------
# Pré-requisitos
# ---------------------------------------------------------------------------

def check_env() -> None:
    """Verifica se o arquivo .env existe e contém OPENROUTER_API_KEY."""
    if not ENV_FILE.exists():
        error(f"Arquivo .env não encontrado em: {ENV_FILE}")
        error("Crie o arquivo com: OPENROUTER_API_KEY=sua-chave-aqui")
        error("Consulte o .env.example para referência.")
        sys.exit(1)

    content = ENV_FILE.read_text(encoding="utf-8")
    if "OPENROUTER_API_KEY" not in content:
        error("OPENROUTER_API_KEY não encontrada no .env.")
        error("Adicione: OPENROUTER_API_KEY=sk-or-...")
        sys.exit(1)

    # Verificar se a chave não está vazia
    match = re.search(r"OPENROUTER_API_KEY\s*=\s*(.+)", content)
    if not match or not match.group(1).strip():
        error("OPENROUTER_API_KEY está definida mas vazia no .env.")
        sys.exit(1)

    info(f".env verificado ✓")


def ensure_database() -> None:
    """Cria o banco de dados caso ele não exista."""
    if DB_FILE.exists():
        info(f"Banco de dados encontrado: {DB_FILE.name} ✓")
        return

    warn(f"Banco de dados não encontrado. Executando setup_db.py...")
    result = subprocess.run(
        [PYTHON, str(ROOT / "setup_db.py")],
        cwd=ROOT,
        capture_output=False,   # mostra saída do setup
    )
    if result.returncode != 0:
        error("Falha ao criar o banco de dados. Verifique os CSVs em dataset/.")
        sys.exit(1)
    info("Banco de dados criado com sucesso ✓")


def ensure_node_modules() -> None:
    """Instala dependências npm se node_modules não existir."""
    node_modules = FRONTEND / "node_modules"
    if node_modules.exists():
        info("node_modules encontrado ✓")
        return

    warn("node_modules não encontrado. Executando npm install...")
    result = subprocess.run(
        ["npm", "install"],
        cwd=FRONTEND,
        capture_output=False,
    )
    if result.returncode != 0:
        error("Falha ao instalar dependências npm. Verifique a instalação do Node.js.")
        sys.exit(1)
    info("Dependências npm instaladas ✓")

# ---------------------------------------------------------------------------
# Gerenciamento de portas
# ---------------------------------------------------------------------------

def kill_port(port: int) -> None:
    """Encerra qualquer processo que esteja usando a porta informada (macOS/Linux)."""
    try:
        result = subprocess.run(
            ["lsof", "-ti", f":{port}"],
            capture_output=True, text=True
        )
        pids = result.stdout.strip().split("\n")
        for pid in pids:
            if pid.strip():
                os.kill(int(pid.strip()), signal.SIGKILL)
                warn(f"Processo PID {pid.strip()} encerrado (porta {port})")
    except (ValueError, ProcessLookupError):
        pass    # Nenhum processo na porta — ok


# ---------------------------------------------------------------------------
# Aguardar backend
# ---------------------------------------------------------------------------

def wait_for_backend(timeout: int = 30) -> bool:
    """
    Faz polling em /api/health até o backend responder 200.
    Retorna True se ficou pronto, False se excedeu o timeout.
    """
    health_url = f"{BACKEND_URL}/api/health"
    deadline = time.time() + timeout
    dots = 0

    while time.time() < deadline:
        try:
            with urllib.request.urlopen(health_url, timeout=2) as resp:
                if resp.status == 200:
                    print()   # quebra linha após os dots
                    return True
        except (urllib.error.URLError, ConnectionRefusedError, OSError):
            pass
        dots += 1
        print(f"\r{CYAN}{BOLD}[BACKEND]{RESET} Aguardando API ficar pronta{'.' * (dots % 4):<4}", end="", flush=True)
        time.sleep(1)

    print()
    return False


# ---------------------------------------------------------------------------
# Stream de logs dos subprocessos
# ---------------------------------------------------------------------------

def stream_output(proc: subprocess.Popen, label: str, color: str) -> None:
    """Lê stdout do processo e imprime com prefixo colorido (execução em thread separada)."""
    import threading

    def _reader():
        for line in iter(proc.stdout.readline, b""):
            text = line.decode("utf-8", errors="replace").rstrip()
            if text:
                print(f"{color}{BOLD}[{label}]{RESET} {DIM}{text}{RESET}")

    t = threading.Thread(target=_reader, daemon=True)
    t.start()


# ---------------------------------------------------------------------------
# Abertura do browser
# ---------------------------------------------------------------------------

def open_browser(url: str) -> None:
    """Tenta abrir o browser padrão do sistema."""
    import webbrowser
    time.sleep(2)   # aguarda o frontend compilar a primeira página
    try:
        webbrowser.open(url)
        info(f"Browser aberto em {url}")
    except Exception:
        warn(f"Não foi possível abrir o browser automaticamente. Acesse: {url}")


# ---------------------------------------------------------------------------
# Entrada principal
# ---------------------------------------------------------------------------

def main() -> None:
    print(f"\n{BOLD}{GREEN}{'=' * 55}{RESET}")
    print(f"{BOLD}{GREEN}  HabitaData DF — Lançador Unificado{RESET}")
    print(f"{BOLD}{GREEN}{'=' * 55}{RESET}\n")

    # 1. Pré-requisitos
    info("Verificando pré-requisitos...")
    check_env()
    ensure_database()
    ensure_node_modules()
    print()

    # 2. Liberar portas
    info(f"Liberando portas {BACKEND_PORT} e {FRONTEND_PORT}...")
    kill_port(BACKEND_PORT)
    kill_port(FRONTEND_PORT)
    time.sleep(0.5)   # pequeno delay para o SO liberar as portas
    print()

    # 3. Subir o backend
    info(f"Iniciando backend FastAPI na porta {BACKEND_PORT}...")
    backend_proc = subprocess.Popen(
        [
            PYTHON, "-m", "uvicorn",       # usa python -m uvicorn (ignora shebang do venv)
            "backend.main:app",
            "--reload",
            "--host", "127.0.0.1",
            "--port", str(BACKEND_PORT),
        ],
        cwd=ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    stream_output(backend_proc, "BACKEND", CYAN)

    # 4. Aguardar o backend estar pronto
    info(f"Aguardando backend em {BACKEND_URL}/api/health ...")
    if not wait_for_backend(timeout=30):
        error("O backend não respondeu em 30 segundos. Encerrando.")
        backend_proc.kill()
        sys.exit(1)
    info(f"Backend pronto! ✓  → {BACKEND_URL}/docs")
    print()

    # 5. Subir o frontend
    info(f"Iniciando frontend Next.js na porta {FRONTEND_PORT}...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=FRONTEND,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    stream_output(frontend_proc, "FRONTEND", GREEN)
    print()

    # 6. Abrir o browser em background
    import threading
    threading.Thread(target=open_browser, args=(FRONTEND_URL,), daemon=True).start()

    print(f"{BOLD}{GREEN}{'=' * 55}{RESET}")
    info(f"Aplicação rodando!")
    info(f"  Frontend  →  {FRONTEND_URL}")
    info(f"  Backend   →  {BACKEND_URL}/docs")
    info(f"  Pressione Ctrl+C para encerrar.")
    print(f"{BOLD}{GREEN}{'=' * 55}{RESET}\n")

    # 7. Manter o script rodando e aguardar Ctrl+C
    try:
        while True:
            # Verificar se algum processo morreu inesperadamente
            if backend_proc.poll() is not None:
                error("O backend encerrou inesperadamente!")
                frontend_proc.kill()
                sys.exit(1)
            if frontend_proc.poll() is not None:
                error("O frontend encerrou inesperadamente!")
                backend_proc.kill()
                sys.exit(1)
            time.sleep(2)

    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}{BOLD}Encerrando HabitaData DF...{RESET}")
        frontend_proc.terminate()
        backend_proc.terminate()
        # Aguardar encerramento gracioso
        try:
            frontend_proc.wait(timeout=5)
            backend_proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            frontend_proc.kill()
            backend_proc.kill()
        info("Aplicação encerrada. Até logo!")
        print()


if __name__ == "__main__":
    main()
