package co.uniandes.boletamaster.persistence.jdbc;

import co.uniandes.boletamaster.persistence.SQLite;
import java.sql.*;

public class AsientoJdbcDAO {
    public long idPorFilaNumero(long localidadId, String fila, int numero) throws Exception {
        String sql = "SELECT id_asiento FROM asiento WHERE localidad_id=? AND fila=? AND numero=?";
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, localidadId);
            ps.setString(2, fila);
            ps.setInt(3, numero);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) throw new IllegalArgumentException("Asiento no existe");
            return rs.getLong(1);
        }
    }
}
