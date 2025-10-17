
package co.uniandes.boletamaster.persistence.jdbc;
import co.uniandes.boletamaster.persistence.SQLite; import co.uniandes.boletamaster.persistence.api.CredencialRepository;
import java.sql.*;
public class CredencialJdbcDAO implements CredencialRepository {
    public void guardar(String login,String hash,String salt) throws Exception {
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("INSERT INTO credencial(login,password_hash,password_salt) VALUES(?,?,?)")) {
            ps.setString(1, login); ps.setString(2, hash); ps.setString(3, salt); ps.executeUpdate();
        }
    }
    public String obtenerHash(String login) throws Exception {
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("SELECT password_hash FROM credencial WHERE login=?")) {
            ps.setString(1, login); ResultSet rs = ps.executeQuery(); return rs.next()?rs.getString(1):null;
        }
    }
    public String obtenerSalt(String login) throws Exception {
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("SELECT password_salt FROM credencial WHERE login=?")) {
            ps.setString(1, login); ResultSet rs = ps.executeQuery(); return rs.next()?rs.getString(1):null;
        }
    }
}
