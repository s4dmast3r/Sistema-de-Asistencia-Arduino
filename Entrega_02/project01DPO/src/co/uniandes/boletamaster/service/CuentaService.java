
package co.uniandes.boletamaster.service;
import co.uniandes.boletamaster.security.Passwords;
import co.uniandes.boletamaster.persistence.api.UsuarioRepository;
import co.uniandes.boletamaster.persistence.api.CredencialRepository;
import co.uniandes.boletamaster.persistence.api.RolRepository;
public class CuentaService {
    private final UsuarioRepository usuarios; private final CredencialRepository credenciales; private final RolRepository roles;
    public CuentaService(UsuarioRepository u, CredencialRepository c, RolRepository r){ this.usuarios=u; this.credenciales=c; this.roles=r; }
    public void registrarComprador(String login,String nombre,String email,String passwordClaro,long saldoInicial) throws Exception {
        if (usuarios.existeLogin(login)) throw new IllegalArgumentException("login existente");
        usuarios.crearUsuario(login,nombre,email);
        String salt = Passwords.newSalt(); String hash = Passwords.hash(passwordClaro, salt);
        credenciales.guardar(login, hash, salt); roles.registrarComprador(login, saldoInicial);
    }
    public void registrarOrganizador(String login,String nombre,String email,String passwordClaro,String empresa) throws Exception {
        if (usuarios.existeLogin(login)) throw new IllegalArgumentException("login existente");
        usuarios.crearUsuario(login,nombre,email);
        String salt = Passwords.newSalt(); String hash = Passwords.hash(passwordClaro, salt);
        credenciales.guardar(login, hash, salt); roles.registrarOrganizador(login, empresa);
    }
    public void registrarAdministrador(String login,String nombre,String email,String passwordClaro) throws Exception {
        if (usuarios.existeLogin(login)) throw new IllegalArgumentException("login existente");
        usuarios.crearUsuario(login,nombre,email);
        String salt = Passwords.newSalt(); String hash = Passwords.hash(passwordClaro, salt);
        credenciales.guardar(login, hash, salt); roles.registrarAdministrador(login);
    }
    public boolean autenticar(String login,String passwordClaro) throws Exception {
        String salt = credenciales.obtenerSalt(login); if (salt==null) return false;
        String esperado = credenciales.obtenerHash(login); return Passwords.verify(passwordClaro, salt, esperado);
    }
}
