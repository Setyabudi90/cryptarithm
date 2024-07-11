import React, { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    const form = document.getElementById("cryptarithm-form");
    const solutionDiv = document.getElementById("solution");

    const handleFormSubmit = (event) => {
      event.preventDefault();
      const input = document.getElementById("cryptarithm-input").value;
      solutionDiv.innerHTML = "";

      if (event) {
        alert("Komputasi akan dijalankan, mohon tunggu beberapa detik...");
      }

      try {
        const start = performance.now();
        const result = solveCryptarithm(input);
        const end = performance.now();
        const timeTaken = (end - start).toFixed(2);
        solutionDiv.innerHTML = `
          <h1 style="color: #eee">Jawaban:</h1>
          <h2>Solusi</h2>
          <p>${result.solution}</p>
          <h3>Langkah-langkah:</h3>
          <ul>
            ${result.steps.map((step) => `<li>${step}</li>`).join("")}
          </ul>
          <p>Waktu komputasi: ${
            timeTaken < 1000 ? `${timeTaken} ms` : `${(timeTaken / 1000).toFixed(2)} s`
          }</p>
        `;
      } catch (error) {
        solutionDiv.innerHTML = `<p style="color: red">${error.message}</p>`;
      }
    };

    form.addEventListener("submit", handleFormSubmit);

    return () => {
      form.removeEventListener("submit", handleFormSubmit);
    };
  }, []);

  function solveCryptarithm(input) {
    const [left, right] = input.split("=").map((s) => s.trim());
    if (!right) {
      throw new Error("Format tidak valid. Pastikan terdapat =");
    }
    const uniqueLetters = [...new Set(input.replace(/[^A-Z]/g, ""))];
    if (uniqueLetters.length > 10) {
      throw new Error("Input terlalu panjang. Hanya 10 huruf unik yang diperbolehkan.");
    }
    const letters = uniqueLetters.join("");
    const permutations = getPermutations("0123456789".split(""), letters.length);
    for (const perm of permutations) {
      const mapping = {};
      letters.split("").forEach((l, i) => (mapping[l] = perm[i]));
      if (isValidMapping(mapping, left.split(/(\+|\-|\*|\/)/).map(s => s.trim()).concat(right))) {
        const mappedLeft = mapTerms(left, mapping);
        const mappedRight = mapTerms(right, mapping);
        try {
          if (evaluateExpression(mappedLeft) === parseInt(mappedRight)) {
            return {
              solution: input.split("").map((char) => mapping[char] || char).join(""),
              steps: [
                `Pemetaan: ${JSON.stringify(mapping)}`,
                `Perhitungan: ${mappedLeft} = ${mappedRight}`,
              ],
            };
          }
        } catch (e) {
          continue;
        }
      }
    }
    throw new Error("Solusi tidak ditemukan.");
  }

  function mapTerms(term, mapping) {
    return term.split("").map((char) => mapping[char] || char).join("");
  }

  function getPermutations(array, length) {
    if (length === 1) {
      return array.map((item) => [item]);
    }
    return array.flatMap((d, i) =>
      getPermutations(array.slice(0, i).concat(array.slice(i + 1)), length - 1).map(
        (p) => [d, ...p]
      )
    );
  }

  function isValidMapping(mapping, terms) {
    for (const term of terms) {
      if (term[0] in mapping && mapping[term[0]] === "0") {
        return false;
      }
    }
    return true;
  }

  function evaluateExpression(expression) {
    return Function("return " + expression)();
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Cryptarithm Solver</h1>
        <form id="cryptarithm-form">
          <input
            type="text"
            id="cryptarithm-input"
            placeholder="Contoh: AB + AB = BCC"
            required
          />
          <button type="submit">Solve</button>
        </form>
        <div id="solution"></div>
      </div>
    </div>
  );
}

export default App;
