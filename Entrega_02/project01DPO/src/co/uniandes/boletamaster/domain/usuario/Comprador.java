package co.uniandes.boletamaster.domain.usuario;

import co.uniandes.boletamaster.domain.valor.Billetera;

public class Comprador extends Usuario {
    private Billetera billetera;
    public Comprador(String login, String nombre, String email, Billetera billetera) { super(login, nombre, email); this.billetera = billetera; }
    public Billetera getBilletera() { return billetera; }
}
