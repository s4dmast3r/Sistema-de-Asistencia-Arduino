package co.uniandes.boletamaster.persistence.jdbc;

import co.uniandes.boletamaster.persistence.SQLite;
import co.uniandes.boletamaster.persistence.api.TiqueteRepository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class TiqueteJdbcDAO implements TiqueteRepository {

    public List<Long> disponiblesNoNumerado(long localidadId, int cantidad) throws Exception {
        List<Long> ids = new ArrayList<>();
        String sql = "SELECT id_tiquete FROM tiquete WHERE localidad_id=? AND tipo='NO_NUMERADO' AND estado='DISPONIBLE' LIMIT ?";
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, localidadId);
            ps.setInt(2, cantidad);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) ids.add(rs.getLong(1));
        }
        return ids;
    }

    public Long disponibleNumerado(long localidadId, long asientoId) throws Exception {
        String sql = "SELECT id_tiquete FROM tiquete WHERE localidad_id=? AND tipo='NUMERADO' AND asiento_id=? AND estado='DISPONIBLE' LIMIT 1";
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, localidadId);
            ps.setLong(2, asientoId);
            ResultSet rs = ps.executeQuery();
            return rs.next() ? rs.getLong(1) : null;
        }
    }

    public void marcarVendido(List<Long> ids) throws Exception {
        if (ids == null || ids.isEmpty()) return;
        StringBuilder sb = new StringBuilder("UPDATE tiquete SET estado='VENDIDO' WHERE id_tiquete IN (");
        for (int i = 0; i < ids.size(); i++) sb.append(i == 0 ? "?" : ",?");
        sb.append(")");
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sb.toString())) {
            int idx = 1;
            for (Long id : ids) ps.setLong(idx++, id);
            ps.executeUpdate();
        }
    }

    public void marcarTransferido(long id) throws Exception {
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("UPDATE tiquete SET estado='TRANSFERIDO' WHERE id_tiquete=?")) {
            ps.setLong(1, id);
            ps.executeUpdate();
        }
    }

    public Long idPorCodigo(String codigo) throws Exception {
        String sql = "SELECT id_tiquete FROM tiquete WHERE codigo_unico=?";
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, codigo);
            ResultSet rs = ps.executeQuery();
            return rs.next() ? rs.getLong(1) : null;
        }
    }

    public long precioTotalCent(long tiqueteId) throws Exception {
        String sql = "SELECT precio_base_cent, cargo_pct, emision_cent FROM tiquete WHERE id_tiquete=?";
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, tiqueteId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) return 0;
            long base = rs.getLong(1);
            int pct = rs.getInt(2);
            long emision = rs.getLong(3);
            long cargos = Math.round(base * (pct / 100.0)) + emision;
            return base + cargos;
        }
    }
}
