package co.uniandes.boletamaster.domain.valor;

import java.util.Objects;

public final class Money {
    private final long centavos;
    public Money(long centavos) { this.centavos = centavos; }
    public long asCentavos() { return centavos; }
    public Money add(Money other) { return new Money(this.centavos + other.centavos); }
    public Money subtract(Money other) { return new Money(this.centavos - other.centavos); }
    public Money multiply(int qty) { return new Money(this.centavos * qty); }
    public static Money fromPesos(double pesos) { long c = Math.round(pesos * 100.0); return new Money(c); }
    public String toString() { long pesos = centavos / 100; long c = Math.abs(centavos % 100); return String.format("$%,d.%02d", pesos, c); }
    public boolean equals(Object o) { if (this == o) return true; if (!(o instanceof Money)) return false; Money m = (Money)o; return centavos == m.centavos; }
    public int hashCode() { return Objects.hash(centavos); }
}
