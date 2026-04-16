async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.message || `Error HTTP ${response.status}`);
    error.payload = payload;
    throw error;
  }

  return payload;
}

export const api = {
  bootstrap() {
    return request("/api/bootstrap");
  },
  preview(draft) {
    return request("/api/preview", {
      method: "POST",
      body: JSON.stringify({ draft })
    });
  },
  applyAction(draft, action) {
    return request("/api/actions", {
      method: "POST",
      body: JSON.stringify({ draft, action })
    });
  },
  listCharacters() {
    return request("/api/characters");
  },
  getCharacter(id) {
    return request(`/api/characters/${id}`);
  },
  createCharacter(draft) {
    return request("/api/characters", {
      method: "POST",
      body: JSON.stringify({ draft })
    });
  },
  updateCharacter(id, draft) {
    return request(`/api/characters/${id}`, {
      method: "PUT",
      body: JSON.stringify({ draft })
    });
  },
  duplicateCharacter(id) {
    return request(`/api/characters/${id}/duplicate`, {
      method: "POST"
    });
  },
  deleteCharacter(id) {
    return request(`/api/characters/${id}`, {
      method: "DELETE"
    });
  },
  importCharacter(draft) {
    return request("/api/characters/import", {
      method: "POST",
      body: JSON.stringify({ draft })
    });
  },
  saveAutosave(draft) {
    return request("/api/autosave", {
      method: "PUT",
      body: JSON.stringify({ draft })
    });
  },
  clearAutosave() {
    return request("/api/autosave", {
      method: "DELETE"
    });
  }
};
