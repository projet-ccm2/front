# Tests - Documentation

Ce dossier contient tous les tests unitaires et d'intégration du projet.

## Structure

```
src/test/
├── setup.ts              # Configuration globale des tests
├── utils/                # Utilitaires pour les tests
│   └── test-utils.tsx    # Helpers de rendu React
├── App.test.tsx          # Tests pour App.tsx
├── main.test.tsx         # Tests pour main.tsx
├── App.css.test.ts       # Tests pour les styles
└── index.test.ts         # Tests d'intégration
```

## Commandes disponibles

```bash
# Lancer les tests en mode watch
npm run test

# Lancer les tests avec l'interface UI
npm run test:ui

# Lancer les tests avec le rapport de couverture
npm run test:coverage

# Lancer les tests en mode watch
npm run test:watch
```

## Couverture de code

Les tests visent une couverture minimale de **80%** pour :

- Lines (lignes)
- Functions (fonctions)
- Branches (branches conditionnelles)
- Statements (instructions)

## Bonnes pratiques

1. **Un test = une responsabilité** : Chaque test doit vérifier une seule chose
2. **Nommage descriptif** : Les noms de tests doivent être clairs et explicites
3. **AAA Pattern** : Arrange, Act, Assert
4. **Isolation** : Les tests ne doivent pas dépendre les uns des autres
5. **Mocking** : Utiliser les mocks pour isoler les dépendances externes

## Exemples

### Test de composant React

```typescript
import { render, screen, fireEvent } from './utils/test-utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('devrait rendre correctement', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Test d'interaction

```typescript
it('devrait répondre aux clics', () => {
  render(<MyComponent />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  expect(button).toHaveTextContent('Clicked');
});
```
