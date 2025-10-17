package co.uniandes.boletamaster.persistence.jdbc;

import co.uniandes.boletamaster.persistence.SQLite;
import java.sql.*;

public class LocalidadJdbcDAO {
    public long idPorNombre(String eventoId, String nombre) throws Exception {
        String sql = "SELECT id_localidad FROM localidad WHERE evento_id=? AND nombre=?";
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, eventoId);
            ps.setString(2, nombre);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) throw new IllegalArgumentException("Localidad no encontrada");
            return rs.getLong(1);
        }
    }
}
