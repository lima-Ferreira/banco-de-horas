const mongoose = require("mongoose");

const LancamentoSchema = new mongoose.Schema(
  {
    funcionarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Funcionario",
      required: true,
    },
    data: {
      type: Date,
      required: true,
    },
    tipo: {
      type: String,
      enum: [
        "Hora extra",
        "Falta justificada",
        "Falta injustificada",
        "Folga",
        "Atestado",
        "Suspensão",
      ],
      required: true,
    },
    operacao: {
      type: String,
      enum: ["Crédito", "Débito"],
      required: function () {
        return this.tipo === "Hora extra";
      },
    },
    horas: {
      type: String,
      required: function () {
        return this.tipo === "Hora extra";
      },
    },
    observacao: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lancamento", LancamentoSchema);
