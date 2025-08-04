type Client = {
  id: string;
  res: any;
};

class SSEManager {
  private clients: Map<string, Client> = new Map();

  addClient(id: string, res: any) {
    this.clients.set(id, { id, res });
    console.log(`[SSE] Client connected: ${id}`);
    console.log(`[SSE] Active clients: ${this.clients.size}`);
  }

  removeClient(id: string) {
    this.clients.delete(id);
    console.log(`[SSE] Client disconnected: ${id}`);
    console.log(`[SSE] Active clients: ${this.clients.size}`);
  }

  broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    this.clients.forEach(({ res }) => res.write(payload));
  }

  sendToClient(id: string, event: string, data: any) {
    const client = this.clients.get(id);
    if (client) {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      client.res.write(payload);
    }
  }

  heartbeat() {
    this.clients.forEach(({ res }) => res.write(`:\n\n`)); // ping
  }
}

export const sseManager = new SSEManager();
