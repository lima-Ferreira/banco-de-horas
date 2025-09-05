const mongoose = require("mongoose");

const funcionarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  cargo: {
    type: String,
    required: true,
  },
  setor: {
    type: String,
    required: true,
  },
  loja: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Funcionario", funcionarioSchema);
