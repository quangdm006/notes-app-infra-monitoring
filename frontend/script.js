const API_URL = "/api/notes";

const form = document.getElementById("note-form");
const idInput = document.getElementById("note-id");
const titleInput = document.getElementById("note-title");
const contentInput = document.getElementById("note-content");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const notesList = document.getElementById("notes-list");

let cachedNotes = [];

async function fetchNotes() {
  const res = await fetch(API_URL);
  cachedNotes = await res.json();
  renderNotes(cachedNotes);
}

function renderNotes(notes) {
  notesList.innerHTML = "";
  if (notes.length === 0) {
    notesList.innerHTML = '<p class="empty">Chưa có ghi chú nào.</p>';
    return;
  }
  notes.forEach((note) => {
    const card = document.createElement("div");
    card.className = "note-card";
    card.innerHTML = `
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.content || "")}</p>
      <small>${new Date(note.created_at).toLocaleString("vi-VN")}</small>
      <div class="note-actions">
        <button class="edit-btn" data-id="${note.id}">Sửa</button>
        <button class="delete-btn" data-id="${note.id}">Xóa</button>
      </div>
    `;
    notesList.appendChild(card);
  });

  document
    .querySelectorAll(".edit-btn")
    .forEach((btn) => btn.addEventListener("click", () => startEdit(btn.dataset.id)));
  document
    .querySelectorAll(".delete-btn")
    .forEach((btn) => btn.addEventListener("click", () => deleteNote(btn.dataset.id)));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function startEdit(id) {
  const note = cachedNotes.find((n) => n.id == id);
  if (!note) return;
  idInput.value = note.id;
  titleInput.value = note.title;
  contentInput.value = note.content || "";
  submitBtn.textContent = "Cập nhật ghi chú";
  cancelBtn.classList.remove("hidden");
  titleInput.focus();
}

function resetForm() {
  idInput.value = "";
  titleInput.value = "";
  contentInput.value = "";
  submitBtn.textContent = "Thêm ghi chú";
  cancelBtn.classList.add("hidden");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = idInput.value;
  const payload = {
    title: titleInput.value,
    content: contentInput.value,
  };

  if (id) {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  resetForm();
  fetchNotes();
});

cancelBtn.addEventListener("click", resetForm);

async function deleteNote(id) {
  if (!confirm("Xóa ghi chú này?")) return;
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  fetchNotes();
}

fetchNotes();
