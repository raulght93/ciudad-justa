// App: ensambla el dossier. Conmuta dirección A (Cartel) / C (Editorial),
// persistida en localStorage.

const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [dir, setDir] = useStateApp(() => localStorage.getItem("cj-dir") || "cartel");
  useEffectApp(() => { localStorage.setItem("cj-dir", dir); document.documentElement.dataset.dir = dir; }, [dir]);

  return (
    <div className="cj" data-dir={dir} style={{ minHeight: "100vh" }}>
      <a href="#capas" className="cj-skip">Saltar al contenido</a>
      <Nav dir={dir} setDir={setDir} />
      <Hero dir={dir} />
      <Ticker />
      <main>
        <Layers />
        <Sawtooth />
        <MapPanel />
        <How />
        <Manifesto />
        <Housing />
      </main>
      <Footer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
