# CalyCompta - Development TODO

## 🏗️ **PRIORITÉ 1 : Architecture Modulaire Complète** (15-20 jours)
**Statut** : Planifié | **Documentation** : `docs/migration/MODULAR_*`



---

## 🔐 Authentication Testing
- [ ] Review and execute authentication test plan
  - See: `docs/testing/AUTHENTICATION_TEST_EXECUTION_PLAN.md`
- [ ] Create test users for each role (membre, user, validateur, admin, superadmin)
- [ ] Test Firebase authentication flow
- [ ] Test API endpoints (/api/activate-user, /api/reset-password)
- [ ] Verify permission levels for all user types
- [ ] Test session management and timeout

## 🔄 VPDive → Caly Migration
- [ ] Review migration docs in `docs/migration/`
- [ ] Week 1: Add source fields & visual badges
- [ ] Week 2: Build enhanced registration form (CalyMob)
- [ ] Week 3-4: Setup communication system (push/email/WhatsApp)
- [ ] Week 5: Testing & UI polish
- [ ] Week 6: Beta deployment & production release
- [ ] Post-launch monitoring & metrics

## 📚 Documentation Disponible
- 📖 `docs/migration/DYNAMIC_PERMISSIONS_PLAN.md` - Plan permissions dynamiques
- 📖 `docs/migration/MODULAR_ARCHITECTURE_PLAN.md` - Architecture modulaire détaillée
- 📖 `docs/migration/MODULAR_MIGRATION_EXECUTION_PLAN.md` - Plan d'exécution partie 1
- 📖 `docs/migration/MODULAR_MIGRATION_EXECUTION_PLAN_PART2.md` - Plan d'exécution partie 2
- 📖 `docs/migration/MODULAR_ARCHITECTURE_SUMMARY.md` - Résumé exécutif avec schémas

## 🎯 Modules à Créer (Post-Migration)
- [ ] Module Inventaire (gestion du matériel)
- [ ] Module Excursions (voyages plongée)
- [ ] Module Rapports (reporting avancé)
- [ ] Module Communication (emails/SMS automatisés)

---
*Last updated: January 16, 2025*
*Architecture Modulaire : Planifiée - 15-20 jours estimés*