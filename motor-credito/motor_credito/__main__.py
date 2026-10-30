"""Sobe o motor-credito em http://localhost:3334 (só biblioteca padrão do Python)."""
import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

from . import elegibilidade

PORTA = int(os.environ.get("PORTA", "3334"))


class Manipulador(BaseHTTPRequestHandler):
    def _responder(self, status, corpo):
        dados = json.dumps(corpo, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        if self.path == "/saude":
            return self._responder(200, {"ok": True, "servico": "motor-credito"})
        self._responder(404, {"erro": "rota não encontrada"})

    def do_POST(self):
        if self.path != "/elegibilidade":
            return self._responder(404, {"erro": "rota não encontrada"})
        tamanho = int(self.headers.get("Content-Length") or 0)
        try:
            corpo = json.loads(self.rfile.read(tamanho) or b"{}")
            return self._responder(200, elegibilidade.avaliar(corpo["cliente"], corpo["hoje"]))
        except NotImplementedError as e:
            return self._responder(501, {"erro": str(e)})
        except (KeyError, ValueError) as e:
            return self._responder(400, {"erro": f"requisição inválida: {e}"})

    def log_message(self, formato, *args):
        print(f"[motor-credito] {self.command} {self.path}")


if __name__ == "__main__":
    print(f"motor-credito no ar em http://localhost:{PORTA}")
    HTTPServer(("127.0.0.1", PORTA), Manipulador).serve_forever()
