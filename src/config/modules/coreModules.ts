import type { ModuleDefinition } from '@/types/module.types';

export const CORE_MODULES: ModuleDefinition[] = [
  {
    id: 'transactions',
    name: 'Transactions Bancaires',
    description: 'Gestion des transactions bancaires et réconciliation',
    icon: 'CreditCard',
    version: '1.0.0',
    category: 'finance',
    isCore: true,
    isActive: true,

    settings: {
      download: {
        autoRenameFiles: {
          key: 'download.autoRenameFiles',
          label: 'Renommer automatiquement les fichiers',
          type: 'boolean',
          defaultValue: false,
          description: 'Active le renommage automatique lors du téléchargement'
        },
        filenamePattern: {
          key: 'download.filenamePattern',
          label: 'Format du nom de fichier',
          type: 'string',
          defaultValue: '{ANNÉE}_{MOIS}_{NUMÉRO}_{DESCRIPTION}',
          description: 'Variables: {ANNÉE}, {MOIS}, {JOUR}, {NUMÉRO}, {DESCRIPTION}',
          validation: {
            pattern: '^[^<>:"/\\|?*]+$'
          }
        },
        useTransactionNumber: {
          key: 'download.useTransactionNumber',
          label: 'Utiliser le numéro de transaction',
          type: 'boolean',
          defaultValue: true
        }
      },
      categorization: {
        enableAI: {
          key: 'categorization.enableAI',
          label: 'Activer les suggestions IA',
          type: 'boolean',
          defaultValue: false,
          description: 'Utilise l\'IA pour suggérer des catégories'
        },
        autoSuggest: {
          key: 'categorization.autoSuggest',
          label: 'Suggestions automatiques',
          type: 'boolean',
          defaultValue: true,
          dependsOn: 'categorization.enableAI'
        },
        requireCategory: {
          key: 'categorization.requireCategory',
          label: 'Catégorie obligatoire',
          type: 'boolean',
          defaultValue: false,
          description: 'Empêche la validation sans catégorie'
        }
      },
      validation: {
        requireDoubleSignature: {
          key: 'validation.requireDoubleSignature',
          label: 'Double signature requise',
          type: 'boolean',
          defaultValue: false
        },
        signatureThreshold: {
          key: 'validation.signatureThreshold',
          label: 'Seuil de double signature (€)',
          type: 'number',
          defaultValue: 100,
          dependsOn: 'validation.requireDoubleSignature',
          validation: {
            min: 0,
            max: 10000
          }
        },
        allowBackdating: {
          key: 'validation.allowBackdating',
          label: 'Autoriser l\'antidatage',
          type: 'boolean',
          defaultValue: false,
          advanced: true
        },
        maxBackdatingDays: {
          key: 'validation.maxBackdatingDays',
          label: 'Jours maximum d\'antidatage',
          type: 'number',
          defaultValue: 30,
          dependsOn: 'validation.allowBackdating',
          validation: {
            min: 1,
            max: 365
          }
        }
      }
    },

    permissions: {
      basic: [
        {
          id: 'view',
          label: 'Voir les transactions',
          description: 'Accès en lecture aux transactions',
          category: 'view',
          riskLevel: 'low'
        },
        {
          id: 'export',
          label: 'Exporter les données',
          description: 'Télécharger les transactions en CSV/Excel',
          category: 'view',
          riskLevel: 'low'
        }
      ],
      management: [
        {
          id: 'create',
          label: 'Créer des transactions',
          description: 'Ajouter de nouvelles transactions',
          category: 'create',
          riskLevel: 'medium'
        },
        {
          id: 'update',
          label: 'Modifier les transactions',
          description: 'Éditer les transactions existantes',
          category: 'update',
          riskLevel: 'medium'
        },
        {
          id: 'delete',
          label: 'Supprimer les transactions',
          description: 'Effacer définitivement les transactions',
          category: 'delete',
          riskLevel: 'high'
        },
        {
          id: 'categorize',
          label: 'Catégoriser',
          description: 'Assigner et modifier les catégories',
          category: 'update',
          riskLevel: 'low'
        }
      ],
      advanced: [
        {
          id: 'sign',
          label: 'Signer numériquement',
          description: 'Apposer une signature numérique',
          category: 'manage',
          riskLevel: 'medium'
        },
        {
          id: 'reconcile',
          label: 'Réconcilier',
          description: 'Pointer et réconcilier avec les relevés bancaires',
          category: 'manage',
          riskLevel: 'medium'
        },
        {
          id: 'link',
          label: 'Lier aux documents',
          description: 'Associer des factures et justificatifs',
          category: 'update',
          riskLevel: 'low'
        }
      ],
      admin: [
        {
          id: 'configure',
          label: 'Configurer le module',
          description: 'Modifier les paramètres du module',
          category: 'admin',
          riskLevel: 'high'
        },
        {
          id: 'audit',
          label: 'Audit complet',
          description: 'Accès à l\'historique et aux logs',
          category: 'admin',
          riskLevel: 'medium'
        }
      ]
    },

    config: {
      routes: [
        {
          path: '/transactions',
          component: 'TransactionList',
          permission: 'view'
        },
        {
          path: '/transactions/import',
          component: 'TransactionImport',
          permission: 'create'
        },
        {
          path: '/transactions/:id',
          component: 'TransactionDetail',
          permission: 'view'
        },
        {
          path: '/transactions/settings',
          component: 'TransactionSettings',
          permission: 'configure'
        }
      ],

      menuItems: [
        {
          id: 'transactions',
          label: 'Transactions',
          icon: 'CreditCard',
          path: '/transactions',
          permission: 'view',
          position: 2,
          subItems: [
            {
              id: 'transactions-list',
              label: 'Liste',
              path: '/transactions',
              permission: 'view'
            },
            {
              id: 'transactions-import',
              label: 'Importer',
              path: '/transactions/import',
              permission: 'create'
            },
            {
              id: 'transactions-settings',
              label: 'Paramètres',
              path: '/transactions/settings',
              permission: 'configure'
            }
          ]
        }
      ],

      widgets: [
        {
          id: 'transaction-summary',
          component: 'TransactionSummaryWidget',
          position: 'dashboard',
          permission: 'view',
          defaultSize: { w: 6, h: 4 }
        },
        {
          id: 'pending-signatures',
          component: 'PendingSignaturesWidget',
          position: 'dashboard',
          permission: 'sign',
          defaultSize: { w: 3, h: 3 }
        }
      ],

      hooks: {
        onInstall: 'createTransactionCategories',
        onEnable: 'activateTransactionSync',
        onDisable: 'pauseTransactionSync'
      }
    },

    createdAt: new Date('2024-01-01')
  },

  // Module Demandes/Dépenses
  {
    id: 'expenses',
    name: 'Demandes de Remboursement',
    description: 'Gestion des demandes de remboursement et notes de frais',
    icon: 'Receipt',
    version: '1.0.0',
    category: 'finance',
    isCore: true,
    isActive: true,

    settings: {
      workflow: {
        autoApprove: {
          key: 'workflow.autoApprove',
          label: 'Approbation automatique',
          type: 'boolean',
          defaultValue: false,
          description: 'Approuve automatiquement les petits montants'
        },
        autoApproveThreshold: {
          key: 'workflow.autoApproveThreshold',
          label: 'Seuil d\'approbation auto (€)',
          type: 'number',
          defaultValue: 50,
          dependsOn: 'workflow.autoApprove',
          validation: {
            min: 0,
            max: 500
          }
        },
        requireReceipts: {
          key: 'workflow.requireReceipts',
          label: 'Justificatifs obligatoires',
          type: 'boolean',
          defaultValue: true
        },
        receiptThreshold: {
          key: 'workflow.receiptThreshold',
          label: 'Seuil justificatif (€)',
          type: 'number',
          defaultValue: 20,
          dependsOn: 'workflow.requireReceipts',
          validation: {
            min: 0,
            max: 100
          }
        }
      },
      notifications: {
        notifyOnSubmission: {
          key: 'notifications.notifyOnSubmission',
          label: 'Notifier à la soumission',
          type: 'boolean',
          defaultValue: true
        },
        notifyOnApproval: {
          key: 'notifications.notifyOnApproval',
          label: 'Notifier à l\'approbation',
          type: 'boolean',
          defaultValue: true
        },
        notifyOnRejection: {
          key: 'notifications.notifyOnRejection',
          label: 'Notifier en cas de rejet',
          type: 'boolean',
          defaultValue: true
        },
        reminderDays: {
          key: 'notifications.reminderDays',
          label: 'Rappel après (jours)',
          type: 'number',
          defaultValue: 7,
          description: 'Envoie un rappel pour les demandes en attente',
          validation: {
            min: 1,
            max: 30
          }
        }
      },
      payment: {
        defaultPaymentMethod: {
          key: 'payment.defaultPaymentMethod',
          label: 'Méthode de paiement par défaut',
          type: 'select',
          defaultValue: 'transfer',
          options: [
            { value: 'transfer', label: 'Virement bancaire' },
            { value: 'cash', label: 'Espèces' },
            { value: 'check', label: 'Chèque' }
          ]
        },
        requireIBAN: {
          key: 'payment.requireIBAN',
          label: 'IBAN obligatoire',
          type: 'boolean',
          defaultValue: true,
          dependsOn: 'payment.defaultPaymentMethod=transfer'
        }
      }
    },

    permissions: {
      requester: [
        {
          id: 'view_own',
          label: 'Voir ses demandes',
          description: 'Accès à ses propres demandes uniquement',
          category: 'view',
          riskLevel: 'low'
        },
        {
          id: 'create',
          label: 'Créer une demande',
          description: 'Soumettre une nouvelle demande',
          category: 'create',
          riskLevel: 'low'
        },
        {
          id: 'update_own',
          label: 'Modifier ses demandes',
          description: 'Éditer ses demandes non approuvées',
          category: 'update',
          riskLevel: 'low',
          requiresCondition: 'status=draft'
        },
        {
          id: 'delete_own',
          label: 'Supprimer ses demandes',
          description: 'Supprimer ses demandes en brouillon',
          category: 'delete',
          riskLevel: 'low',
          requiresCondition: 'status=draft'
        }
      ],
      approver: [
        {
          id: 'view_all',
          label: 'Voir toutes les demandes',
          description: 'Accès à toutes les demandes du club',
          category: 'view',
          riskLevel: 'medium'
        },
        {
          id: 'approve',
          label: 'Approuver les demandes',
          description: 'Valider les demandes de remboursement',
          category: 'manage',
          riskLevel: 'high'
        },
        {
          id: 'reject',
          label: 'Rejeter les demandes',
          description: 'Refuser les demandes avec motif',
          category: 'manage',
          riskLevel: 'medium'
        },
        {
          id: 'comment',
          label: 'Commenter',
          description: 'Ajouter des commentaires aux demandes',
          category: 'update',
          riskLevel: 'low'
        }
      ],
      admin: [
        {
          id: 'update_all',
          label: 'Modifier toutes les demandes',
          description: 'Éditer n\'importe quelle demande',
          category: 'update',
          riskLevel: 'high'
        },
        {
          id: 'delete_all',
          label: 'Supprimer toutes les demandes',
          description: 'Effacer définitivement les demandes',
          category: 'delete',
          riskLevel: 'critical'
        },
        {
          id: 'export',
          label: 'Exporter les données',
          description: 'Télécharger l\'historique complet',
          category: 'view',
          riskLevel: 'medium'
        },
        {
          id: 'configure',
          label: 'Configurer le module',
          description: 'Modifier les paramètres du module',
          category: 'admin',
          riskLevel: 'high'
        }
      ]
    },

    config: {
      routes: [
        {
          path: '/expenses',
          component: 'ExpenseList',
          permission: 'view_own'
        },
        {
          path: '/expenses/new',
          component: 'ExpenseForm',
          permission: 'create'
        },
        {
          path: '/expenses/:id',
          component: 'ExpenseDetail',
          permission: 'view_own'
        },
        {
          path: '/expenses/settings',
          component: 'ExpenseSettings',
          permission: 'configure'
        }
      ],

      menuItems: [
        {
          id: 'expenses',
          label: 'Dépenses',
          icon: 'Receipt',
          path: '/expenses',
          permission: 'view_own',
          position: 3,
          badge: {
            type: 'count',
            value: 'pendingCount'
          }
        }
      ],

      widgets: [
        {
          id: 'expense-summary',
          component: 'ExpenseSummaryWidget',
          position: 'dashboard',
          permission: 'view_own',
          defaultSize: { w: 4, h: 3 }
        },
        {
          id: 'pending-approvals',
          component: 'PendingApprovalsWidget',
          position: 'dashboard',
          permission: 'approve',
          defaultSize: { w: 4, h: 4 }
        }
      ]
    },

    createdAt: new Date('2024-01-01')
  },

  // Module Événements
  {
    id: 'events',
    name: 'Événements & Activités',
    description: 'Organisation et gestion des événements du club',
    icon: 'Calendar',
    version: '1.0.0',
    category: 'operations',
    isCore: true,
    isActive: true,
    dependencies: ['expenses'], // Les événements peuvent générer des dépenses

    settings: {
      general: {
        defaultEventType: {
          key: 'general.defaultEventType',
          label: 'Type d\'événement par défaut',
          type: 'select',
          defaultValue: 'sortie',
          options: [
            { value: 'sortie', label: 'Sortie plongée' },
            { value: 'formation', label: 'Formation' },
            { value: 'reunion', label: 'Réunion' },
            { value: 'social', label: 'Événement social' }
          ]
        },
        allowGuestRegistration: {
          key: 'general.allowGuestRegistration',
          label: 'Autoriser les invités',
          type: 'boolean',
          defaultValue: true
        },
        maxGuestsPerMember: {
          key: 'general.maxGuestsPerMember',
          label: 'Invités max par membre',
          type: 'number',
          defaultValue: 2,
          dependsOn: 'general.allowGuestRegistration',
          validation: {
            min: 0,
            max: 10
          }
        }
      },
      registration: {
        requirePaymentUpfront: {
          key: 'registration.requirePaymentUpfront',
          label: 'Paiement à l\'inscription',
          type: 'boolean',
          defaultValue: false
        },
        registrationDeadlineDays: {
          key: 'registration.registrationDeadlineDays',
          label: 'Délai d\'inscription (jours avant)',
          type: 'number',
          defaultValue: 3,
          validation: {
            min: 0,
            max: 30
          }
        },
        waitingListEnabled: {
          key: 'registration.waitingListEnabled',
          label: 'Activer la liste d\'attente',
          type: 'boolean',
          defaultValue: true
        }
      },
      communication: {
        sendConfirmation: {
          key: 'communication.sendConfirmation',
          label: 'Email de confirmation',
          type: 'boolean',
          defaultValue: true
        },
        sendReminder: {
          key: 'communication.sendReminder',
          label: 'Email de rappel',
          type: 'boolean',
          defaultValue: true
        },
        reminderDaysBefore: {
          key: 'communication.reminderDaysBefore',
          label: 'Rappel (jours avant)',
          type: 'number',
          defaultValue: 2,
          dependsOn: 'communication.sendReminder',
          validation: {
            min: 1,
            max: 7
          }
        }
      }
    },

    permissions: {
      participant: [
        {
          id: 'view',
          label: 'Voir les événements',
          description: 'Consulter la liste des événements',
          category: 'view',
          riskLevel: 'low'
        },
        {
          id: 'register',
          label: 'S\'inscrire',
          description: 'S\'inscrire aux événements ouverts',
          category: 'create',
          riskLevel: 'low'
        },
        {
          id: 'cancel_registration',
          label: 'Annuler son inscription',
          description: 'Se désinscrire d\'un événement',
          category: 'delete',
          riskLevel: 'low'
        }
      ],
      organizer: [
        {
          id: 'create',
          label: 'Créer des événements',
          description: 'Organiser de nouveaux événements',
          category: 'create',
          riskLevel: 'medium'
        },
        {
          id: 'update_own',
          label: 'Modifier ses événements',
          description: 'Éditer les événements qu\'on organise',
          category: 'update',
          riskLevel: 'medium'
        },
        {
          id: 'manage_participants',
          label: 'Gérer les participants',
          description: 'Valider/refuser les inscriptions',
          category: 'manage',
          riskLevel: 'medium'
        },
        {
          id: 'send_messages',
          label: 'Envoyer des messages',
          description: 'Communiquer avec les participants',
          category: 'manage',
          riskLevel: 'low'
        }
      ],
      admin: [
        {
          id: 'update_all',
          label: 'Modifier tous les événements',
          description: 'Éditer n\'importe quel événement',
          category: 'update',
          riskLevel: 'high'
        },
        {
          id: 'delete',
          label: 'Supprimer des événements',
          description: 'Annuler définitivement des événements',
          category: 'delete',
          riskLevel: 'high'
        },
        {
          id: 'financial_report',
          label: 'Rapports financiers',
          description: 'Voir les bilans financiers des événements',
          category: 'admin',
          riskLevel: 'medium'
        },
        {
          id: 'configure',
          label: 'Configurer le module',
          description: 'Modifier les paramètres du module',
          category: 'admin',
          riskLevel: 'high'
        }
      ]
    },

    config: {
      routes: [
        {
          path: '/events',
          component: 'EventList',
          permission: 'view'
        },
        {
          path: '/events/calendar',
          component: 'EventCalendar',
          permission: 'view'
        },
        {
          path: '/events/new',
          component: 'EventForm',
          permission: 'create'
        },
        {
          path: '/events/:id',
          component: 'EventDetail',
          permission: 'view'
        }
      ],

      menuItems: [
        {
          id: 'events',
          label: 'Événements',
          icon: 'Calendar',
          path: '/events',
          permission: 'view',
          position: 4
        }
      ],

      widgets: [
        {
          id: 'upcoming-events',
          component: 'UpcomingEventsWidget',
          position: 'dashboard',
          permission: 'view',
          defaultSize: { w: 6, h: 4 }
        }
      ]
    },

    createdAt: new Date('2024-01-01')
  }
];

// Modules additionnels (non-core)
export const OPTIONAL_MODULES: ModuleDefinition[] = [
  {
    id: 'inventory',
    name: 'Gestion d\'Inventaire',
    description: 'Suivi du matériel, stocks et prêts',
    icon: 'Package',
    version: '1.0.0',
    category: 'operations',
    isCore: false,
    isActive: false,

    settings: {
      general: {
        enableBarcodes: {
          key: 'general.enableBarcodes',
          label: 'Activer les codes-barres',
          type: 'boolean',
          defaultValue: false,
          description: 'Permet le scan de codes-barres pour l\'inventaire'
        },
        autoGenerateReferences: {
          key: 'general.autoGenerateReferences',
          label: 'Références automatiques',
          type: 'boolean',
          defaultValue: true
        },
        referencePrefix: {
          key: 'general.referencePrefix',
          label: 'Préfixe des références',
          type: 'string',
          defaultValue: 'INV',
          dependsOn: 'general.autoGenerateReferences'
        }
      },
      alerts: {
        lowStockWarning: {
          key: 'alerts.lowStockWarning',
          label: 'Alerte stock bas',
          type: 'boolean',
          defaultValue: true
        },
        lowStockThreshold: {
          key: 'alerts.lowStockThreshold',
          label: 'Seuil d\'alerte',
          type: 'number',
          defaultValue: 5,
          dependsOn: 'alerts.lowStockWarning',
          validation: {
            min: 1,
            max: 100
          }
        },
        maintenanceReminders: {
          key: 'alerts.maintenanceReminders',
          label: 'Rappels de maintenance',
          type: 'boolean',
          defaultValue: true
        },
        maintenanceFrequencyDays: {
          key: 'alerts.maintenanceFrequencyDays',
          label: 'Fréquence maintenance (jours)',
          type: 'number',
          defaultValue: 180,
          dependsOn: 'alerts.maintenanceReminders',
          validation: {
            min: 30,
            max: 365
          }
        }
      },
      loans: {
        requireApproval: {
          key: 'loans.requireApproval',
          label: 'Approbation requise',
          type: 'boolean',
          defaultValue: false,
          description: 'Les prêts doivent être approuvés'
        },
        requireCaution: {
          key: 'loans.requireCaution',
          label: 'Caution obligatoire',
          type: 'boolean',
          defaultValue: true
        },
        defaultCautionAmount: {
          key: 'loans.defaultCautionAmount',
          label: 'Montant caution par défaut (€)',
          type: 'number',
          defaultValue: 50,
          dependsOn: 'loans.requireCaution',
          validation: {
            min: 0,
            max: 500
          }
        },
        maxLoanDurationDays: {
          key: 'loans.maxLoanDurationDays',
          label: 'Durée max de prêt (jours)',
          type: 'number',
          defaultValue: 30,
          validation: {
            min: 1,
            max: 365
          }
        },
        sendReturnReminder: {
          key: 'loans.sendReturnReminder',
          label: 'Rappel de retour',
          type: 'boolean',
          defaultValue: true
        },
        reminderDaysBefore: {
          key: 'loans.reminderDaysBefore',
          label: 'Rappel (jours avant)',
          type: 'number',
          defaultValue: 3,
          dependsOn: 'loans.sendReturnReminder',
          validation: {
            min: 1,
            max: 7
          }
        }
      }
    },

    permissions: {
      viewer: [
        {
          id: 'view',
          label: 'Consulter l\'inventaire',
          description: 'Voir la liste du matériel',
          category: 'view',
          riskLevel: 'low'
        },
        {
          id: 'search',
          label: 'Rechercher',
          description: 'Rechercher dans l\'inventaire',
          category: 'view',
          riskLevel: 'low'
        }
      ],
      operator: [
        {
          id: 'add_items',
          label: 'Ajouter du matériel',
          description: 'Créer de nouveaux articles',
          category: 'create',
          riskLevel: 'medium'
        },
        {
          id: 'edit_items',
          label: 'Modifier le matériel',
          description: 'Éditer les informations',
          category: 'update',
          riskLevel: 'medium'
        },
        {
          id: 'move_items',
          label: 'Déplacer le matériel',
          description: 'Changer l\'emplacement',
          category: 'update',
          riskLevel: 'low'
        },
        {
          id: 'create_loan',
          label: 'Créer un prêt',
          description: 'Enregistrer un nouveau prêt',
          category: 'create',
          riskLevel: 'medium'
        },
        {
          id: 'return_item',
          label: 'Enregistrer un retour',
          description: 'Valider le retour du matériel',
          category: 'update',
          riskLevel: 'medium'
        }
      ],
      manager: [
        {
          id: 'delete_items',
          label: 'Supprimer du matériel',
          description: 'Retirer de l\'inventaire',
          category: 'delete',
          riskLevel: 'high'
        },
        {
          id: 'approve_loans',
          label: 'Approuver les prêts',
          description: 'Valider les demandes de prêt',
          category: 'manage',
          riskLevel: 'medium'
        },
        {
          id: 'manage_cautions',
          label: 'Gérer les cautions',
          description: 'Encaisser/rembourser les cautions',
          category: 'manage',
          riskLevel: 'high'
        },
        {
          id: 'maintenance',
          label: 'Gérer la maintenance',
          description: 'Planifier et suivre la maintenance',
          category: 'manage',
          riskLevel: 'medium'
        }
      ],
      admin: [
        {
          id: 'configure',
          label: 'Configurer le module',
          description: 'Modifier les paramètres',
          category: 'admin',
          riskLevel: 'high'
        },
        {
          id: 'manage_types',
          label: 'Gérer les types',
          description: 'Créer/modifier les types d\'articles',
          category: 'admin',
          riskLevel: 'medium'
        },
        {
          id: 'manage_locations',
          label: 'Gérer les emplacements',
          description: 'Définir les lieux de stockage',
          category: 'admin',
          riskLevel: 'medium'
        },
        {
          id: 'export',
          label: 'Exporter les données',
          description: 'Télécharger l\'inventaire complet',
          category: 'admin',
          riskLevel: 'low'
        },
        {
          id: 'audit',
          label: 'Audit complet',
          description: 'Voir l\'historique des mouvements',
          category: 'admin',
          riskLevel: 'medium'
        }
      ]
    },

    config: {
      routes: [
        {
          path: '/inventory',
          component: 'InventoryDashboard',
          permission: 'view'
        },
        {
          path: '/inventory/items',
          component: 'ItemList',
          permission: 'view'
        },
        {
          path: '/inventory/items/new',
          component: 'ItemForm',
          permission: 'add_items'
        },
        {
          path: '/inventory/items/:id',
          component: 'ItemDetail',
          permission: 'view'
        },
        {
          path: '/inventory/loans',
          component: 'LoanList',
          permission: 'view'
        },
        {
          path: '/inventory/loans/new',
          component: 'LoanForm',
          permission: 'create_loan'
        },
        {
          path: '/inventory/maintenance',
          component: 'MaintenanceSchedule',
          permission: 'maintenance'
        },
        {
          path: '/inventory/settings',
          component: 'InventorySettings',
          permission: 'configure'
        }
      ],

      menuItems: [
        {
          id: 'inventory',
          label: 'Inventaire',
          icon: 'Package',
          path: '/inventory',
          permission: 'view',
          position: 5,
          subItems: [
            {
              id: 'inventory-items',
              label: 'Matériel',
              path: '/inventory/items',
              permission: 'view'
            },
            {
              id: 'inventory-loans',
              label: 'Prêts',
              path: '/inventory/loans',
              permission: 'view',
              badge: {
                type: 'count',
                value: 'activeLoanCount'
              }
            },
            {
              id: 'inventory-maintenance',
              label: 'Maintenance',
              path: '/inventory/maintenance',
              permission: 'maintenance'
            }
          ]
        }
      ],

      widgets: [
        {
          id: 'inventory-status',
          component: 'InventoryStatusWidget',
          position: 'dashboard',
          permission: 'view',
          defaultSize: { w: 4, h: 3 }
        },
        {
          id: 'active-loans',
          component: 'ActiveLoansWidget',
          position: 'dashboard',
          permission: 'view',
          defaultSize: { w: 4, h: 4 }
        },
        {
          id: 'maintenance-alerts',
          component: 'MaintenanceAlertsWidget',
          position: 'sidebar',
          permission: 'maintenance',
          defaultSize: { w: 3, h: 3 }
        }
      ],

      hooks: {
        onInstall: 'createDefaultItemTypes',
        onEnable: 'startMaintenanceScheduler',
        onDisable: 'stopMaintenanceScheduler'
      },

      scheduledTasks: [
        {
          id: 'maintenance-check',
          name: 'Vérification maintenance',
          schedule: '0 9 * * *', // Tous les jours à 9h
          handler: 'checkMaintenanceDue',
          enabled: true
        },
        {
          id: 'loan-reminder',
          name: 'Rappel de retour',
          schedule: '0 10 * * *', // Tous les jours à 10h
          handler: 'sendLoanReturnReminders',
          enabled: true
        }
      ]
    },

    createdAt: new Date('2024-01-01')
  },

  {
    id: 'excursions',
    name: 'Excursions & Voyages',
    description: 'Organisation d\'excursions et voyages plongée',
    icon: 'MapPin',
    version: '1.0.0',
    category: 'operations',
    isCore: false,
    isActive: false,
    dependencies: ['events', 'expenses'],

    settings: {
      // Paramètres similaires mais spécifiques aux excursions
      booking: {
        requireAdvancePayment: {
          key: 'booking.requireAdvancePayment',
          label: 'Acompte obligatoire',
          type: 'boolean',
          defaultValue: true
        },
        advancePaymentPercent: {
          key: 'booking.advancePaymentPercent',
          label: 'Pourcentage d\'acompte',
          type: 'number',
          defaultValue: 30,
          dependsOn: 'booking.requireAdvancePayment',
          validation: {
            min: 10,
            max: 100
          }
        },
        paymentDeadlineDays: {
          key: 'booking.paymentDeadlineDays',
          label: 'Délai de paiement (jours avant)',
          type: 'number',
          defaultValue: 14,
          validation: {
            min: 1,
            max: 60
          }
        }
      },
      pricing: {
        memberDiscount: {
          key: 'pricing.memberDiscount',
          label: 'Réduction membre (%)',
          type: 'number',
          defaultValue: 10,
          validation: {
            min: 0,
            max: 50
          }
        },
        earlyBirdDiscount: {
          key: 'pricing.earlyBirdDiscount',
          label: 'Réduction early bird (%)',
          type: 'number',
          defaultValue: 5,
          validation: {
            min: 0,
            max: 30
          }
        },
        earlyBirdDaysBefore: {
          key: 'pricing.earlyBirdDaysBefore',
          label: 'Délai early bird (jours)',
          type: 'number',
          defaultValue: 30,
          validation: {
            min: 7,
            max: 90
          }
        }
      },
      cancellation: {
        allowCancellation: {
          key: 'cancellation.allowCancellation',
          label: 'Autoriser les annulations',
          type: 'boolean',
          defaultValue: true
        },
        cancellationDeadlineDays: {
          key: 'cancellation.cancellationDeadlineDays',
          label: 'Délai d\'annulation (jours)',
          type: 'number',
          defaultValue: 7,
          dependsOn: 'cancellation.allowCancellation',
          validation: {
            min: 1,
            max: 30
          }
        },
        refundPolicy: {
          key: 'cancellation.refundPolicy',
          label: 'Politique de remboursement',
          type: 'select',
          defaultValue: 'partial',
          dependsOn: 'cancellation.allowCancellation',
          options: [
            { value: 'full', label: 'Remboursement total' },
            { value: 'partial', label: 'Remboursement partiel' },
            { value: 'none', label: 'Aucun remboursement' },
            { value: 'credit', label: 'Avoir uniquement' }
          ]
        },
        partialRefundPercent: {
          key: 'cancellation.partialRefundPercent',
          label: 'Pourcentage remboursé',
          type: 'number',
          defaultValue: 70,
          dependsOn: 'cancellation.refundPolicy=partial',
          validation: {
            min: 0,
            max: 100
          }
        }
      }
    },

    permissions: {
      // Permissions similaires au module events mais adaptées
      traveler: [
        {
          id: 'view',
          label: 'Voir les excursions',
          description: 'Consulter les excursions disponibles',
          category: 'view',
          riskLevel: 'low'
        },
        {
          id: 'book',
          label: 'Réserver',
          description: 'S\'inscrire aux excursions',
          category: 'create',
          riskLevel: 'low'
        },
        {
          id: 'cancel_own',
          label: 'Annuler sa réservation',
          description: 'Annuler sa propre participation',
          category: 'delete',
          riskLevel: 'low'
        }
      ],
      organizer: [
        {
          id: 'create',
          label: 'Créer des excursions',
          description: 'Organiser de nouvelles excursions',
          category: 'create',
          riskLevel: 'medium'
        },
        {
          id: 'manage_bookings',
          label: 'Gérer les réservations',
          description: 'Valider et gérer les inscriptions',
          category: 'manage',
          riskLevel: 'medium'
        },
        {
          id: 'manage_payments',
          label: 'Gérer les paiements',
          description: 'Suivre les acomptes et soldes',
          category: 'manage',
          riskLevel: 'high'
        }
      ],
      admin: [
        {
          id: 'financial_report',
          label: 'Rapports financiers',
          description: 'Bilans détaillés des excursions',
          category: 'admin',
          riskLevel: 'medium'
        },
        {
          id: 'configure',
          label: 'Configurer le module',
          description: 'Paramètres des excursions',
          category: 'admin',
          riskLevel: 'high'
        }
      ]
    },

    config: {
      routes: [
        {
          path: '/excursions',
          component: 'ExcursionList',
          permission: 'view'
        },
        {
          path: '/excursions/new',
          component: 'ExcursionForm',
          permission: 'create'
        },
        {
          path: '/excursions/:id',
          component: 'ExcursionDetail',
          permission: 'view'
        },
        {
          path: '/excursions/:id/bookings',
          component: 'BookingManagement',
          permission: 'manage_bookings'
        }
      ],

      menuItems: [
        {
          id: 'excursions',
          label: 'Excursions',
          icon: 'MapPin',
          path: '/excursions',
          permission: 'view',
          position: 6
        }
      ],

      widgets: [
        {
          id: 'upcoming-excursions',
          component: 'UpcomingExcursionsWidget',
          position: 'dashboard',
          permission: 'view',
          defaultSize: { w: 6, h: 4 }
        }
      ]
    },

    createdAt: new Date('2024-01-01')
  }
];

export const ALL_MODULES = [...CORE_MODULES, ...OPTIONAL_MODULES];
