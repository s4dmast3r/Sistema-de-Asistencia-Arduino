package co.uniandes.boletamaster.persistence;

import java.sql.Connection;

public interface Tx<T> {
    T run(Connection c) throws Exception;

    static <T> T inTransaction(Tx<T> body) throws Exception {
        var c = SQLite.get();
        boolean prev = c.getAutoCommit();
        try {
            c.setAutoCommit(false);
            T out = body.run(c);
            c.commit();
            return out;
        } catch (Exception e) {
            c.rollback();
            throw e;
        } finally {
            c.setAutoCommit(prev);
        }
    }
}
