package co.uniandes.boletamaster.domain.usuario;

public abstract class Usuario {
    protected String login;
    protected String nombre;
    protected String email;
    protected Usuario(String login, String nombre, String email) { this.login = login; this.nombre = nombre; this.email = email; }
    public String getLogin() { return login; }
    public String getNombre() { return nombre; }
    public String getEmail() { return email; }
}
