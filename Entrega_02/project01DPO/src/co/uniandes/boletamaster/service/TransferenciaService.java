package co.uniandes.boletamaster.service;

import java.time.LocalDateTime;

import co.uniandes.boletamaster.persistence.SQLite;
import co.uniandes.boletamaster.persistence.api.TiqueteRepository;

import java.sql.Connection;
import java.sql.PreparedStatement;

public class TransferenciaService {

    private final TiqueteRepository tiquetes;

    public TransferenciaService(TiqueteRepository t) { this.tiquetes = t; }

    public void transferir(String codigoUnico, String deLogin, String aLogin) throws Exception {
        Long id = tiquetes.idPorCodigo(codigoUnico);
        if (id == null) throw new IllegalArgumentException("Código inválido");
        try (Connection c = SQLite.get()) {
            try (PreparedStatement ps = c.prepareStatement(
                "INSERT INTO transferencia(tiquete_id,de_login,a_login,fecha) VALUES (?,?,?,?)")) {
                ps.setLong(1, id);
                ps.setString(2, deLogin);
                ps.setString(3, aLogin);
                ps.setString(4, LocalDateTime.now().toString());
                ps.executeUpdate();
            }
        }
        tiquetes.marcarTransferido(id);
    }
}
