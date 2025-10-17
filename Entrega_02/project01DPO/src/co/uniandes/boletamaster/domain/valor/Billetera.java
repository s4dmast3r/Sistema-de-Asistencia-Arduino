package co.uniandes.boletamaster.domain.valor;

public class Billetera {
    private long saldoCentavos;
    public Billetera(long saldoCentavos) { this.saldoCentavos = saldoCentavos; }
    public long saldo() { return saldoCentavos; }
    public void recargar(long montoCentavos) { saldoCentavos += montoCentavos; }
    public boolean debitar(long montoCentavos) { if (saldoCentavos >= montoCentavos) { saldoCentavos -= montoCentavos; return true; } return false; }
}
