
package co.uniandes.boletamaster.persistence.jdbc;
import co.uniandes.boletamaster.persistence.SQLite; import co.uniandes.boletamaster.persistence.api.UsuarioRepository;
import java.sql.*;
public class UsuarioJdbcDAO implements UsuarioRepository {
    public void crearUsuario(String login,String nombre,String email) throws Exception {
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("INSERT INTO usuario(login,nombre,email) VALUES(?,?,?)")) {
            ps.setString(1, login); ps.setString(2, nombre); ps.setString(3, email); ps.executeUpdate();
        }
    }
    public boolean existeLogin(String login) throws Exception {
        try (Connection c = SQLite.get(); PreparedStatement ps = c.prepareStatement("SELECT 1 FROM usuario WHERE login=?")) {
            ps.setString(1, login); ResultSet rs = ps.executeQuery(); return rs.next();
        }
    }
}
