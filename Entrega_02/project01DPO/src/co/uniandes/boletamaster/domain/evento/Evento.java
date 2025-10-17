package co.uniandes.boletamaster.domain.evento;

public class Evento {
    private String id;
    private String nombre;
    private String fecha;
    private TipoEvento tipo;
    private EstadoEvento estado;
    private String venueId;
    public Evento(String id, String nombre, String fecha, TipoEvento tipo, EstadoEvento estado, String venueId) {
        this.id = id; this.nombre = nombre; this.fecha = fecha; this.tipo = tipo; this.estado = estado; this.venueId = venueId;
    }
    public String getId() { return id; }
    public String getNombre() { return nombre; }
    public String getFecha() { return fecha; }
    public TipoEvento getTipo() { return tipo; }
    public EstadoEvento getEstado() { return estado; }
    public String getVenueId() { return venueId; }
}
