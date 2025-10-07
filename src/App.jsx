import { useState, useEffect } from "react";

function App() {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [registros, setRegistros] = useState([]);

  const guardar = async () => {
    if (!peso || !altura) return alert("Completa ambos campos");

    await fetch("http://localhost:4000/api/guardar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ peso, altura }),
    });

    setPeso("");
    setAltura("");
    cargarRegistros();
  };

  const cargarRegistros = async () => {
    const res = await fetch("http://localhost:4000/api/registros");
    const data = await res.json();
    setRegistros(data);
  };

  useEffect(() => {
    cargarRegistros();
  }, []);

  return (
    <div style={{ maxWidth: "400px", margin: "40px auto", textAlign: "center" }}>
      <h2>Registro de Peso y Altura</h2>

      <input
        type="number"
        placeholder="Peso (kg)"
        value={peso}
        onChange={(e) => setPeso(e.target.value)}
        style={{ margin: "5px", padding: "8px", width: "90%" }}
      />

      <input
        type="number"
        placeholder="Altura (cm)"
        value={altura}
        onChange={(e) => setAltura(e.target.value)}
        style={{ margin: "5px", padding: "8px", width: "90%" }}
      />

      <button onClick={guardar} style={{ padding: "10px 20px", marginTop: "10px" }}>
        Guardar
      </button>

      <h3 style={{ marginTop: "30px" }}>Historial</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {registros.map((r) => (
          <li key={r.id}>
            {r.peso} kg - {r.altura} cm ({new Date(r.fecha).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
