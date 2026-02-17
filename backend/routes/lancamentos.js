const express = require("express");
const router = express.Router();
const Lancamento = require("../models/Lancamento");
const checkAdmin = require("../middlewares/checkAdmin"); // 1. IMPORTA O SEGURANÇA

// Criar novo lançamento - PROTEGIDO
router.post("/", checkAdmin, async (req, res) => {
  // 2. ADICIONA O MIDDLEWARE AQUI
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

// Atualizar lançamento - PROTEGIDO
router.put("/:id", checkAdmin, async (req, res) => {
  // 3. ADICIONA O MIDDLEWARE AQUI
  try {
    const { data, tipo, operacao, horas, observacao } = req.body;

    const atualizado = await Lancamento.findByIdAndUpdate(
      req.params.id,
      { data, tipo, operacao, horas, observacao },
      { new: true },
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

// Excluir lançamento - PROTEGIDO
router.delete("/:id", checkAdmin, async (req, res) => {
  // 4. ADICIONA O MIDDLEWARE AQUI
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

// Buscar lançamentos por funcionário - PÚBLICO (LOGADO)
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

// Buscar todos - PÚBLICO (LOGADO)
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
