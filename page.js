// Scripts communs aux pages secondaires (réalisations, mentions légales, confidentialité).
// Fichier externe pour que la CSP puisse interdire les scripts incorporés dans les pages.
document.addEventListener('DOMContentLoaded', () => {
    // Apparition des tuiles
    document.querySelectorAll('.reveal').forEach(el => {
        setTimeout(() => el.classList.add('active'), 100);
    });
    // Année du pied de page
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});
