package co.uniandes.boletamaster.domain.tiquete;

public class Tiquete {
    private long id;
    private String eventoId;
    private long localidadId;
    private TipoTiquete tipo;
    private Long asientoId;
    private EstadoTiquete estado;
    private boolean transferible;
    private String codigoUnico;
    private long precioBaseCent;
    private int cargoPct;
    private long emisionCent;
    public Tiquete(long id, String eventoId, long localidadId, TipoTiquete tipo, Long asientoId, EstadoTiquete estado, boolean transferible, String codigoUnico, long precioBaseCent, int cargoPct, long emisionCent) {
        this.id = id; this.eventoId = eventoId; this.localidadId = localidadId; this.tipo = tipo; this.asientoId = asientoId; this.estado = estado; this.transferible = transferible; this.codigoUnico = codigoUnico; this.precioBaseCent = precioBaseCent; this.cargoPct = cargoPct; this.emisionCent = emisionCent;
    }
    public long getId() { return id; }
    public String getEventoId() { return eventoId; }
    public long getLocalidadId() { return localidadId; }
    public TipoTiquete getTipo() { return tipo; }
    public Long getAsientoId() { return asientoId; }
    public EstadoTiquete getEstado() { return estado; }
    public boolean isTransferible() { return transferible; }
    public String getCodigoUnico() { return codigoUnico; }
    public long getPrecioBaseCent() { return precioBaseCent; }
    public int getCargoPct() { return cargoPct; }
    public long getEmisionCent() { return emisionCent; }
}
