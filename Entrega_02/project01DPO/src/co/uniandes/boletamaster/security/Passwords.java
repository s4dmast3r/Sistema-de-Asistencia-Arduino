
package co.uniandes.boletamaster.security;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
public final class Passwords {
    private Passwords() { }
    public static String newSalt() { byte[] s = new byte[16]; new SecureRandom().nextBytes(s); return Base64.getEncoder().encodeToString(s); }
    public static String hash(String plain, String base64Salt) {
        try {
            byte[] salt = Base64.getDecoder().decode(base64Salt);
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(salt);
            byte[] out = md.digest(plain.getBytes("UTF-8"));
            return Base64.getEncoder().encodeToString(out);
        } catch (Exception e) { throw new RuntimeException(e); }
    }
    public static boolean verify(String plain, String base64Salt, String expectedHash) { return hash(plain, base64Salt).equals(expectedHash); }
}
