# Ninibu Frontend v0.18.1 — Deployment Consistency Patch

- Keeps the v0.18.0 Web Admin Control Center unchanged.
- Updates the frontend Docker image fallback to `ninibu-frontend:0.18.1`.
- Aligns deployment documentation with Backend v0.26.1 and the host-MySQL server topology.
- Keeps the parent Expo mobile application at v0.17.0 because no mobile feature contract changed in this patch.
- Corrected local Web backend fallback from port 8080 to 8081.
- Corrected Expo application/runtime version metadata to the intended mobile v0.17.0.
- Aligned private shared workspace package metadata to v0.18.1.
