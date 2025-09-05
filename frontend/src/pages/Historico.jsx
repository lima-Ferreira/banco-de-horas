import { useEffect, useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useApi } from "../hooks/useApi";
import "../estilos-pdf.css";

function Historico() {
  const [lancamentos, setLancamentos] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [filtroFuncionario, setFiltroFuncionario] = useState("");
  const [dataInicio, setDataInicio] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [dataFim, setDataFim] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [modalAberto, setModalAberto] = useState(false);
  const [edicao, setEdicao] = useState(null);
  const { request, loading } = useApi();

  const pdfRef = useRef();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const dataLanc = await request("/lancamentos");
    setLancamentos(dataLanc);

    const dataFunc = await request("/funcionarios");
    setFuncionarios(dataFunc);
  };
  const converterHorasParaMinutos = (hora) => {
    if (!hora) return 0;
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  const formatarMinutosParaHoras = (minutos) => {
    const sinal = minutos < 0 ? "-" : "+";
    const abs = Math.abs(minutos);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${sinal}${h}h ${m}min`;
  };

  const deletarLancamento = async (id) => {
    if (!window.confirm("Deseja excluir este lançamento?")) return;
    await request(`/lancamentos/${id}`, { method: "DELETE" });
    carregarDados();
  };

  const abrirModalEdicao = (lanc) => {
    const dataFormatada = formatarDataLocal(parseDataLocal(lanc.data));
    setEdicao({ ...lanc, data: dataFormatada });
    setModalAberto(true);
  };

  const salvarEdicao = async () => {
    const { _id, data, tipo, operacao, horas, observacao } = edicao;
    await request(`/lancamentos/${_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, tipo, operacao, horas, observacao }),
    });
    setModalAberto(false);
    setEdicao(null);
    carregarDados();
  };

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Função para corrigir o bug da data
  const parseDataLocal = (dataStr) => {
    const [ano, mes, dia] = dataStr.split("-").map(Number);
    return new Date(ano, mes - 1, dia); // mês é zero-based
  };

  const formatarDataLocal = (date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  const gerarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const larguraPagina = doc.internal.pageSize.getWidth();

    const loja = "LOJA 04 - FL DEP";
    const periodo = `PERÍODO DE ${parseDataLocal(
      dataInicio
    ).toLocaleDateString()} ATÉ ${parseDataLocal(
      dataFim
    ).toLocaleDateString()}`;

    doc.setFontSize(10);
    doc.text(loja, larguraPagina / 2, 15, { align: "center" });
    doc.text(periodo, larguraPagina / 2, 20, { align: "center" });
    doc.text("LISTAGEM DE BANCO HORAS POR FUNCIONÁRIO", larguraPagina / 2, 25, {
      align: "center",
    });
    let posY = 40;

    Object.values(agrupado).forEach((grupo) => {
      doc.setFontSize(10);
      doc.text(`Funcionário: ${grupo.nome}`, 4.4, posY);
      posY += 2;

      autoTable(doc, {
        startY: posY,
        head: [["Data", "Tipo", "Operação", "Horas", "Observação"]],
        body: grupo.eventos.map((l) => [
          new Date(l.data).toLocaleDateString(),
          l.tipo,
          l.operacao || "-",
          l.horas || "-",
          capitalize(l.observacao || "-"),
        ]),
        theme: "grid",
        headStyles: {
          fillColor: [220, 220, 220],
          textColor: 0,
          lineWidth: 0.1,
          halign: "center",
          valign: "middle",
        },
        bodyStyles: {
          fontSize: 9,
          textColor: 20,
          halign: "center",
          lineWidth: 0.1,
          valign: "middle",
        },
        columnStyles: {
          4: { halign: "left" },
        },
        styles: {
          cellPadding: 2,
          overflow: "linebreak",
          halign: "left",
        },
        margin: { left: 4, right: 4 },
      });

      posY = doc.lastAutoTable.finalY + 4;

      doc.setTextColor(0, 128, 0);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Créditos: ${formatarMinutosParaHoras(grupo.creditos)}  / `,
        4,
        posY
      );
      doc.setTextColor(252, 104, 54);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Débitos: ${formatarMinutosParaHoras(-grupo.debitos)}  /`,
        45,
        posY
      );
      doc.setTextColor(255, 0, 0);
      doc.setFont("helvetica", "italic");
      doc.text(`Faltas: ${grupo.faltas}  /`, 83, posY);
      doc.setTextColor(0, 0, 255);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Saldo Líquido de Horas: ${formatarMinutosParaHoras(
          grupo.creditos - grupo.debitos
        )} `,
        105,
        posY
      );
      doc.setTextColor(0, 0, 0);

      posY += 12;
    });

    doc.setFontSize(11);
    doc.text("Totais Gerais", 4, posY);
    posY += 6;
    doc.setTextColor(0, 128, 0);
    doc.text(
      `Total de Créditos: ${formatarMinutosParaHoras(totalGeral.creditos)}`,
      4,
      posY
    );
    posY += 6;
    doc.setTextColor(252, 104, 54);
    doc.text(
      `Total de Débitos: ${formatarMinutosParaHoras(-totalGeral.debitos)}`,
      4,
      posY
    );
    posY += 6;
    doc.setTextColor(255, 0, 0);
    doc.text(`Total de Faltas: ${totalGeral.faltas}`, 4, posY);
    posY += 6;
    doc.setTextColor(0, 0, 255);
    doc.text(
      `Saldo Geral: ${formatarMinutosParaHoras(
        totalGeral.creditos - totalGeral.debitos
      )}`,
      4,
      posY
    );

    doc.save(
      `Relatorio de Horas Extras-${new Date()
        .toLocaleDateString("pt-BR")
        .replace(/\//g, "-")}.pdf`
    );
  };

  const lancamentosFiltrados = lancamentos.filter((l) => {
    const nome = l.funcionarioId?.nome?.toLowerCase() || "";
    const dentroDoNome = filtroFuncionario
      ? nome.includes(filtroFuncionario.toLowerCase())
      : true;

    // Corrigido: força a data a ser tratada como local
    const dataLanc = l.data ? parseDataLocal(l.data.split("T")[0]) : null;

    const dentroDoInicio = dataInicio
      ? dataLanc >= parseDataLocal(dataInicio)
      : true;
    const dentroDoFim = dataFim ? dataLanc <= parseDataLocal(dataFim) : true;

    return dentroDoNome && dentroDoInicio && dentroDoFim;
  });

  const agrupado = {};
  lancamentosFiltrados.forEach((l) => {
    const id = l.funcionarioId?._id;
    if (!id) return;

    if (!agrupado[id]) {
      agrupado[id] = {
        nome: l.funcionarioId.nome,
        eventos: [],
        creditos: 0,
        debitos: 0,
        faltas: 0,
      };
    }

    const minutos = converterHorasParaMinutos(l.horas);

    if (l.tipo === "Hora extra") {
      if (l.operacao === "Crédito") agrupado[id].creditos += minutos;
      else if (l.operacao === "Débito") agrupado[id].debitos += minutos;
    }

    if (l.tipo.includes("Falta")) agrupado[id].faltas += 1;

    agrupado[id].eventos.push(l);
  });

  const totalGeral = { creditos: 0, debitos: 0, faltas: 0 };
  Object.values(agrupado).forEach((g) => {
    totalGeral.creditos += g.creditos;
    totalGeral.debitos += g.debitos;
    totalGeral.faltas += g.faltas;
  });
  const lojaSelecionada =
    funcionarios.find((f) => f.nome === filtroFuncionario)?.loja || "";

  return (
    <div className="px-4 py-6">
      {/* Indicador de loading */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow">Carregando...</div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-4">Histórico Geral</h2>
      {/* Filtros */}
      <div className="bg-white p-4 rounded shadow mb-6 no-print">
        <h3 className="text-lg font-semibold mb-2">Filtros</h3>
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filtroFuncionario}
            onChange={(e) => setFiltroFuncionario(e.target.value)}
            className=" border p-2 rounded text-sm text-gray-700 capitalize"
          >
            <option value="">Todos os funcionários</option>
            {funcionarios.map((f) => (
              <option key={f._id} value={f.nome}>
                {f.nome}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={gerarPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Exportar como PDF
          </button>
        </div>
      </div>

      <div className="border rounded shadow-inner max-h-[70vh] overflow-y-auto p-4 pb-40">
        <div ref={pdfRef} className="p-4 bg-white text-black">
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold">
              LOJA 04{lojaSelecionada} - FL DEP
            </h1>
            <h2 className="text-base">
              PERÍODO DE{" "}
              {parseDataLocal(dataInicio).toLocaleDateString("pt-BR")} ATÉ{" "}
              {parseDataLocal(dataFim).toLocaleDateString("pt-BR")}
            </h2>
            <h3 className="text-base font-semibold mt-1">
              LISTAGEM DE BANCO HORAS POR FUNCIONÁRIO
            </h3>
          </div>

          {Object.values(agrupado).map((grupo, idx) => (
            <div key={idx} className="mb-8 bg-white p-4 rounded shadow">
              <h2 className="text-base font-bold ">{grupo.nome}</h2>
              <table className="table-pdf">
                <thead className="p-2 border-2 bg-gray-200 ">
                  <tr>
                    <th className="p-1 border-2 ">Data</th>
                    <th className="p-1 border-2">Tipo</th>
                    <th className="p-1 border-2">Operação</th>
                    <th className="p-1 border-2">Horas</th>
                    <th className="p-1 border-2 w-[800px]">Observação</th>
                    <th className="p-1 border-2 no-print">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.eventos.map((l, i) => (
                    <tr key={i}>
                      <td className="p-1  border-gray-400 border-[1px] align-middle text-center">
                        {new Date(l.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-1 border-gray-400 border-[1px] align-middle text-center w-[160px]">
                        {l.tipo}
                      </td>
                      <td
                        className={`p-1 border-gray-400 border-[1px] align-middle text-center ${
                          l.operacao === "Débito"
                            ? "text-red-600 font-bold"
                            : ""
                        }`}
                      >
                        {l.operacao || "-"}
                      </td>
                      <td className="p-1  border-gray-400 border-[1px] align-middle text-center">
                        {l.horas || "-"}
                      </td>
                      <td
                        className={`p-1 border-gray-400 border-[1px] align-middle text-left capitalize ${
                          l.operacao === "Débito"
                            ? "text-red-600 font-semibold"
                            : ""
                        }`}
                      >
                        {l.observacao || "-"}
                      </td>
                      <td className="p-1  border-gray-400 border-[1px] align-middle no-print text-center w-[120px]">
                        <button
                          className="text-blue-600 hover:underline mr-2"
                          onClick={() => abrirModalEdicao(l)}
                        >
                          Editar
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => deletarLancamento(l._id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-base ">
                <p className="text-sm italic  text-green-800 ">
                  Créditos: {formatarMinutosParaHoras(grupo.creditos)}
                </p>
                <p className="text-sm italic text-orange-700">
                  Débitos: {formatarMinutosParaHoras(-grupo.debitos)}
                </p>
                <p className="text-sm italic text-red-800 ">
                  Faltas: {grupo.faltas}
                </p>
                <p className="text-sm italic text-blue-800">
                  Saldo Líquido:
                  {formatarMinutosParaHoras(grupo.creditos - grupo.debitos)}
                </p>
              </div>
            </div>
          ))}

          <hr className="my-4" />
          <div className="bg-gray-100 p-4 rounded ">
            <h2 className="text-lg font-bold mb-2">Totais Gerais</h2>
            <p className="italic text-green-800">
              Total de Créditos:
              <strong className="italic text-green-800">
                {" "}
                {formatarMinutosParaHoras(totalGeral.creditos)}
              </strong>
            </p>
            <p className="italic text-orange-700">
              Total de Débitos:
              <strong className="italic text-orange-700">
                {" "}
                {formatarMinutosParaHoras(-totalGeral.debitos)}{" "}
              </strong>{" "}
            </p>
            <p className="italic text-red-800">
              Total de Faltas:
              <strong className="italic text-red-800">
                {" "}
                {totalGeral.faltas}
              </strong>{" "}
            </p>
            <p className="italic text-blue-800">
              Saldo Geral de Horas:
              <strong className="italic text-blue-800">
                {" "}
                {formatarMinutosParaHoras(
                  totalGeral.creditos - totalGeral.debitos
                )}
              </strong>
            </p>
          </div>
        </div>

        {modalAberto && edicao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Editar Lançamento</h3>
              <div className="space-y-3">
                <input
                  type="date"
                  value={edicao.data}
                  onChange={(e) =>
                    setEdicao({ ...edicao, data: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
                <select
                  value={edicao.tipo}
                  onChange={(e) =>
                    setEdicao({ ...edicao, tipo: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                >
                  <option>Hora extra</option>
                  <option>Falta justificada</option>
                  <option>Falta injustificada</option>
                </select>
                {edicao.tipo === "Hora extra" && (
                  <>
                    <select
                      value={edicao.operacao}
                      onChange={(e) =>
                        setEdicao({ ...edicao, operacao: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    >
                      <option>Crédito</option>
                      <option>Débito</option>
                    </select>
                    <input
                      type="time"
                      value={edicao.horas}
                      onChange={(e) =>
                        setEdicao({ ...edicao, horas: e.target.value })
                      }
                      className="w-full border p-2 rounded"
                    />
                  </>
                )}
                <textarea
                  value={edicao.observacao}
                  onChange={(e) =>
                    setEdicao({ ...edicao, observacao: e.target.value })
                  }
                  rows={3}
                  className="w-full border p-2 rounded"
                  placeholder="Observação"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setModalAberto(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarEdicao}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Historico;
