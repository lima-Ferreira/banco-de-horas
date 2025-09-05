const express = require("express");
const router = express.Router();
const Lancamento = require("../models/Lancamento");

// Criar novo lançamento
router.post("/", async (req, res) => {
  try {
    const { funcionarioId, data, horas, tipo, operacao, observacao } = req.body;

    const novoLancamento = new Lancamento({
      funcionarioId,
      data,
      tipo,
      operacao,
      horas,
      observacao,
    });

    await novoLancamento.save();
    res.status(201).json(novoLancamento);
  } catch (err) {
    console.error("Erro ao salvar lançamento:", err);
    res.status(500).json({ message: "Erro ao salvar lançamento" });
  }
});

// Atualizar lançamento
router.put("/:id", async (req, res) => {
  try {
    const { data, tipo, operacao, horas, observacao } = req.body;

    const atualizado = await Lancamento.findByIdAndUpdate(
      req.params.id,
      { data, tipo, operacao, horas, observacao },
      { new: true }
    );

    if (!atualizado) {
      return res.status(404).json({ message: "Lançamento não encontrado" });
    }

    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar lançamento:", err);
    res.status(500).json({ message: "Erro ao atualizar lançamento" });
  }
});

// Excluir lançamento
router.delete("/:id", async (req, res) => {
  try {
    const deletado = await Lancamento.findByIdAndDelete(req.params.id);

    if (!deletado) {
      return res.status(404).json({ message: "Lançamento não encontrado" });
    }

    res.json({ message: "Lançamento excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir lançamento:", err);
    res.status(500).json({ message: "Erro ao excluir lançamento" });
  }
});

// Buscar lançamentos por funcionário
router.get("/funcionario/:id", async (req, res) => {
  try {
    const lancamentos = await Lancamento.find({
      funcionarioId: req.params.id,
    }).sort({ data: -1 });

    res.json(lancamentos);
  } catch (err) {
    console.error("Erro ao buscar histórico:", err);
    res.status(500).json({ message: "Erro ao buscar histórico" });
  }
});

// Buscar todos
router.get("/", async (req, res) => {
  try {
    const lancamentos = await Lancamento.find()
      .sort({ data: -1 })
      .populate("funcionarioId");

    res.json(lancamentos);
  } catch (err) {
    console.error("Erro ao buscar lançamentos:", err);
    res.status(500).json({ message: "Erro ao buscar lançamentos" });
  }
});

module.exports = router;
