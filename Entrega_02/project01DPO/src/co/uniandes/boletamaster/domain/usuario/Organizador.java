package co.uniandes.boletamaster.domain.usuario;

public class Organizador extends Empleado {
    private String empresa;
    public Organizador(String login, String nombre, String email, String empresa) { super(login, nombre, email); this.empresa = empresa; }
    public String getEmpresa() { return empresa; }
}
