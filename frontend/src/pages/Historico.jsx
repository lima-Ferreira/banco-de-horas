import { useEffect, useState, useRef, useCallback } from "react";
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
    () => new Date().toISOString().split("T")[0],
  );
  const [dataFim, setDataFim] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [modalAberto, setModalAberto] = useState(false);
  const [edicao, setEdicao] = useState(null);
  const { request, loading } = useApi();

  const pdfRef = useRef();

  // 1. CARREGAMENTO SEGURO (Adicionado useCallback e /api)
  const carregarDados = useCallback(async () => {
    try {
      const dataLanc = await request("/api/lancamentos");
      setLancamentos(dataLanc || []);

      const dataFunc = await request("/api/funcionarios");
      setFuncionarios(dataFunc || []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  }, [request]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

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

  // 2. CORREÇÃO DE ROTAS (DELETE e PUT)
  const deletarLancamento = async (id) => {
    if (!window.confirm("Deseja excluir este lançamento?")) return;
    try {
      await request(`/api/lancamentos/${id}`, { method: "DELETE" });
      carregarDados();
    } catch (err) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const salvarEdicao = async () => {
    const { _id, data, tipo, operacao, horas, observacao } = edicao;
    try {
      await request(`/api/lancamentos/${_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, tipo, operacao, horas, observacao }),
      });
      setModalAberto(false);
      setEdicao(null);
      carregarDados();
    } catch (err) {
      alert("Erro ao salvar: " + err.message);
    }
  };

  const abrirModalEdicao = (lanc) => {
    const dataFormatada = formatarDataLocal(
      parseDataLocal(lanc.data.split("T")[0]),
    );
    setEdicao({ ...lanc, data: dataFormatada });
    setModalAberto(true);
  };

  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const parseDataLocal = (dataStr) => {
    const [ano, mes, dia] = dataStr.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  };

  const formatarDataLocal = (date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  };

  // --- LÓGICA DE PDF ORIGINAL MANTIDA ---
  const gerarPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const larguraPagina = doc.internal.pageSize.getWidth();
    const loja = "LOJA 04 - FL DEP";
    const periodo = `PERÍODO DE ${parseDataLocal(dataInicio).toLocaleDateString()} ATÉ ${parseDataLocal(dataFim).toLocaleDateString()}`;

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
        columnStyles: { 4: { halign: "left" } },
        styles: { cellPadding: 2, overflow: "linebreak", halign: "left" },
        margin: { left: 4, right: 4 },
      });
      posY = doc.lastAutoTable.finalY + 4;
      doc.setTextColor(0, 128, 0);
      doc.text(
        `Créditos: ${formatarMinutosParaHoras(grupo.creditos)}  / `,
        4,
        posY,
      );
      doc.setTextColor(252, 104, 54);
      doc.text(
        `Débitos: ${formatarMinutosParaHoras(-grupo.debitos)}  /`,
        45,
        posY,
      );
      doc.setTextColor(255, 0, 0);
      doc.text(`Faltas: ${grupo.faltas}  /`, 83, posY);
      doc.setTextColor(0, 0, 255);
      doc.text(
        `Saldo Líquido de Horas: ${formatarMinutosParaHoras(grupo.creditos - grupo.debitos)} `,
        105,
        posY,
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
      posY,
    );
    posY += 6;
    doc.setTextColor(252, 104, 54);
    doc.text(
      `Total de Débitos: ${formatarMinutosParaHoras(-totalGeral.debitos)}`,
      4,
      posY,
    );
    posY += 6;
    doc.setTextColor(255, 0, 0);
    doc.text(`Total de Faltas: ${totalGeral.faltas}`, 4, posY);
    posY += 6;
    doc.setTextColor(0, 0, 255);
    doc.text(
      `Saldo Geral: ${formatarMinutosParaHoras(totalGeral.creditos - totalGeral.debitos)}`,
      4,
      posY,
    );
    doc.save(
      `Relatorio de Horas Extras-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`,
    );
  };

  // --- FILTROS E AGRUPAMENTO ---
  const lancamentosFiltrados = lancamentos.filter((l) => {
    const nome = l.funcionarioId?.nome?.toLowerCase() || "";
    const dentroDoNome = filtroFuncionario
      ? nome.includes(filtroFuncionario.toLowerCase())
      : true;
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
    <div className="px-2 py-4 md:px-4 md:py-6">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded shadow font-bold">
            Carregando...
          </div>
        </div>
      )}

      <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-4 uppercase">
        Histórico Geral
      </h2>

      {/* Filtros Responsivos */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 no-print border border-gray-100">
        <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">
          Filtros
        </h3>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <select
            value={filtroFuncionario}
            onChange={(e) => setFiltroFuncionario(e.target.value)}
            className="w-full md:flex-1 border p-2 rounded-lg text-sm capitalize outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full md:w-auto border p-2 rounded-lg text-sm"
          />
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full md:w-auto border p-2 rounded-lg text-sm"
          />
          <button
            onClick={gerarPDF}
            className="w-full md:w-auto bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase hover:bg-emerald-700 transition-all shadow-md"
          >
            PDF
          </button>
        </div>
      </div>

      {/* Container com Scroll para não quebrar no celular */}
      <div className="border rounded-2xl shadow-inner max-h-[75vh] overflow-y-auto overflow-x-auto bg-gray-50 p-2 md:p-4">
        <div
          ref={pdfRef}
          className="bg-white text-black min-w-[900px] p-4 rounded-xl shadow-sm"
        >
          <div className="text-center mb-6 border-b pb-4">
            <h1 className="text-lg font-black uppercase">
              LOJA 04{lojaSelecionada} - FL DEP
            </h1>
            <h2 className="text-sm font-bold text-slate-600 uppercase">
              PERÍODO DE{" "}
              {parseDataLocal(dataInicio).toLocaleDateString("pt-BR")} ATÉ{" "}
              {parseDataLocal(dataFim).toLocaleDateString("pt-BR")}
            </h2>
          </div>

          {Object.values(agrupado).map((grupo, idx) => (
            <div
              key={idx}
              className="mb-10 bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
            >
              <h2 className="text-base font-black text-blue-900 mb-3 uppercase tracking-tight">
                {grupo.nome}
              </h2>
              <table className="w-full border-collapse mb-4 text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-2 border font-bold text-slate-700">
                      Data
                    </th>
                    <th className="p-2 border font-bold text-slate-700">
                      Tipo
                    </th>
                    <th className="p-2 border font-bold text-slate-700">
                      Operação
                    </th>
                    <th className="p-2 border font-bold text-slate-700">
                      Horas
                    </th>
                    <th className="p-2 border font-bold text-slate-700 w-[40%]">
                      Observação
                    </th>
                    <th className="p-2 border font-bold text-slate-700 no-print">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.eventos.map((l, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-2 border text-center">
                        {new Date(l.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="p-2 border text-center">{l.tipo}</td>
                      <td
                        className={`p-2 border text-center font-bold ${l.operacao === "Débito" ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {l.operacao || "-"}
                      </td>
                      <td className="p-2 border text-center font-mono font-bold">
                        {l.horas || "-"}
                      </td>
                      <td className="p-2 border text-left capitalize">
                        {l.observacao || "-"}
                      </td>
                      <td className="p-2 border text-center no-print space-x-2">
                        <button
                          className="text-blue-600 font-bold hover:underline"
                          onClick={() => abrirModalEdicao(l)}
                        >
                          Editar
                        </button>
                        <button
                          className="text-rose-600 font-bold hover:underline"
                          onClick={() => deletarLancamento(l._id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex flex-wrap gap-4 bg-slate-50 p-3 rounded-lg border-l-4 border-blue-500">
                <p className="text-xs font-bold text-emerald-700">
                  Créditos: {formatarMinutosParaHoras(grupo.creditos)}
                </p>
                <p className="text-xs font-bold text-rose-700">
                  Débitos: {formatarMinutosParaHoras(-grupo.debitos)}
                </p>
                <p className="text-xs font-bold text-slate-700">
                  Faltas: {grupo.faltas}
                </p>
                <p className="text-xs font-black text-blue-800">
                  Saldo:{" "}
                  {formatarMinutosParaHoras(grupo.creditos - grupo.debitos)}
                </p>
              </div>
            </div>
          ))}

          {/* Totais Gerais Final */}
          <div className="bg-slate-800 p-6 rounded-xl text-white mt-8">
            <h2 className="text-lg font-black mb-4 uppercase tracking-widest border-b border-slate-600 pb-2">
              Totais Gerais do Período
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Total Créditos
                </p>
                <p className="text-lg font-black text-emerald-400">
                  {formatarMinutosParaHoras(totalGeral.creditos)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Total Débitos
                </p>
                <p className="text-lg font-black text-rose-400">
                  {formatarMinutosParaHoras(-totalGeral.debitos)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Total Faltas
                </p>
                <p className="text-lg font-black text-amber-400">
                  {totalGeral.faltas}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Saldo Líquido Geral
                </p>
                <p className="text-lg font-black text-blue-400">
                  {formatarMinutosParaHoras(
                    totalGeral.creditos - totalGeral.debitos,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição (Corrigido para combinar com o novo Layout) */}
      {modalAberto && edicao && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tighter border-b pb-2">
              Editar Lançamento
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Data
                </label>
                <input
                  type="date"
                  value={edicao.data}
                  onChange={(e) =>
                    setEdicao({ ...edicao, data: e.target.value })
                  }
                  className="w-full border-gray-200 border p-3 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Tipo
                </label>
                <select
                  value={edicao.tipo}
                  onChange={(e) =>
                    setEdicao({ ...edicao, tipo: e.target.value })
                  }
                  className="w-full border-gray-200 border p-3 rounded-xl text-sm"
                >
                  <option>Hora extra</option>
                  <option>Falta justificada</option>
                  <option>Falta injustificada</option>
                  <option>Atestado</option>
                  <option>Suspensão</option>
                </select>
              </div>
              {edicao.tipo === "Hora extra" && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Operação
                    </label>
                    <select
                      value={edicao.operacao}
                      onChange={(e) =>
                        setEdicao({ ...edicao, operacao: e.target.value })
                      }
                      className="w-full border-gray-200 border p-3 rounded-xl text-sm"
                    >
                      <option>Crédito</option>
                      <option>Débito</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Horas
                    </label>
                    <input
                      type="time"
                      value={edicao.horas}
                      onChange={(e) =>
                        setEdicao({ ...edicao, horas: e.target.value })
                      }
                      className="w-full border-gray-200 border p-3 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Observação
                </label>
                <textarea
                  value={edicao.observacao}
                  onChange={(e) =>
                    setEdicao({ ...edicao, observacao: e.target.value })
                  }
                  rows={3}
                  className="w-full border-gray-200 border p-3 rounded-xl text-sm"
                  placeholder="Ex: Atraso no ônibus..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setModalAberto(false)}
                className="flex-1 py-3 text-slate-400 font-bold text-xs uppercase tracking-widest"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Historico;
