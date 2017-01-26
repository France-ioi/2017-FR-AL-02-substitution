import React from 'react';
import EpicComponent from 'epic-component';

/*const assetUrl = function (name) {
   return require(`./assets/${name}`);
};*/
export const Task1 = EpicComponent(self => {

   self.render = function () {
      const {task} = self.props;
      return (
         <div className="taskInstructions">
            <h1>Substitution mono-alphabétique 1</h1>
            <h2>Méthode utilisée pour chiffrer / déchiffrer un message</h2>

            <p>Pour chiffrer un message, on décide de remplacer chaque lettre de l’alphabet par une autre lettre, toujours la même. C’est ce que l’on appelle une substitution.</p>

            <p>Par exemple, si on choisit la substitution suivante :</p>
            <table className="tableBorders">
            <tbody>
               <tr>
                  <th>Clair</th>
                  <td>a</td>
                  <td>b</td>
                  <td>c</td>
                  <td>d</td>
                  <td>e</td>
                  <td>f</td>
                  <td>g</td>
                  <td>h</td>
                  <td>i</td>
                  <td>j</td>
                  <td>k</td>
                  <td>l</td>
               </tr>
               <tr>
                  <th>Chiffré</th>
                  <td>R</td>
                  <td>D</td>
                  <td>G</td>
                  <td>I</td>
                  <td>L</td>
                  <td>Z</td>
                  <td>Q</td>
                  <td>F</td>
                  <td>A</td>
                  <td>U</td>
                  <td>B</td>
                  <td>T</td>
               </tr>
            </tbody>
            </table>

            <p>Lorsque l’on chiffre un message, la lettre 'a' est remplacée par un 'R', 'b' par un 'D', etc.</p>

            <p>Ainsi, chiffrer le message “alice” donne “RTAGL” :</p>

            <table className="pre">
            <tbody>
               <tr>
                  <td>Message :</td>
                  <td>a</td>
                  <td>l</td>
                  <td>i</td>
                  <td>c</td>
                  <td>e</td>
               </tr>
               <tr>
                  <td>Message chiffré :</td>
                  <td>R</td>
                  <td>T</td>
                  <td>A</td>
                  <td>G</td>
                  <td>L</td>
               </tr>
            </tbody>
            </table>

            <p>Pour déchiffrer, un message, on applique la substitution inverse :</p>

            <table className="tableBorders">
            <tbody>
               <tr>
                  <th>Chiffré</th>
                  <td>A</td>
                  <td>B</td>
                  <td>D</td>
                  <td>F</td>
                  <td>G</td>
                  <td>I</td>
                  <td>L</td>
                  <td>Q</td>
                  <td>R</td>
                  <td>T</td>
                  <td>U</td>
                  <td>Z</td>
               </tr>
               <tr>
                  <th>Déchiffré</th>
                  <td>i</td>
                  <td>k</td>
                  <td>b</td>
                  <td>h</td>
                  <td>c</td>
                  <td>d</td>
                  <td>e</td>
                  <td>g</td>
                  <td>a</td>
                  <td>l</td>
                  <td>j</td>
                  <td>f</td>
               </tr>
            </tbody>
            </table>

            <p>Cette méthode de chiffrement n’est pas très sûre, surtout lorsque l’on ne modifie pas les espaces, car on peut deviner certaines lettres et reconstruire le message petit à petit. C’est le but de cet exercice !</p>

            <h2>Ce qui vous est donné</h2>

            <p>Le texte d’origine est formé d’une ou plusieurs petites phrases mises bout à bout dont on a retiré les accents et la ponctuation.</p>

            <p>On a appliqué une substitution portant sur les 26 lettres de l’alphabet, pour obtenir le texte chiffré, que l’on vous fournit. Pour vous aider à vous retrouver, les lettres chiffrées sont en majuscules, tandis que les lettres déchiffrées sont en minuscules.</p>

            <h2>Ce qui vous est demandé</h2>

            <p>Votre objectif est de retrouver le texte d’origine en déterminant la substitution à appliquer pour déchiffrer le texte qui vous est donné.</p>

            <p>Pour modifier la substitution, déplacez une lettre de sa deuxième rangée (lettre déchiffrée) en la glissant sous la lettre chiffrée de votre choix. Ainsi, si vous pensez que chaque lettre 'A' du message chiffré est en fait un 'e' dans le message d’origine, déplacez le 'e' de la rangée du bas pour le placez sous le 'A'.</p>

            <img src="/images/lockTool.png" alt="visuel de l'outil Substitution"/>

            <h2>Utilisation des cadenas</h2>

            <p>Vous pouvez cliquer sur les cadenas sous les lettres de la substitution pour marquer celles dont vous êtes certains. Une fois le cadenas activé, la lettre correspondante ne peut plus être déplacée dans la substitution. Vous éviterez ainsi de les déplacer par erreur. Cliquez de nouveau sur un cadenas pour le désactiver.</p>

            <h2>Indices</h2>

            <p>Pour 10 points, vous pouvez demander à quelle lettre déchiffrée correspond une lettre chiffrée, ou vice versa. Cliquez simplement sur le ‘?’ dont vous souhaitez révéler la valeur dans la substitution.</p>

            <p>Une fois un indice obtenu, la lettre correspondante dans la substitution est définitivement bloquée et ne peut plus être déplacée, puisque l’on sait que c’est la bonne.</p>

            <h2>Avertissement</h2>

            <p>Il est possible, exceptionnellement, de tomber sur un texte déchiffré qui semble bien français mais n’est pas la réponse attendue. Par exemple si le texte clair est “Je mange souvent”, on pourra tomber sur “Je range souvent” qui est bien du français mais n’est pas identique au texte d’origine donc ne sera pas accepté. À vous d’envisager différentes possibilités jusqu’à trouver la bonne.</p>

            <p>Si par contre deux substitutions différentes permettent d’obtenir le texte d’origine, les deux substitutions sont valides et seront acceptées. Cela peut arriver si le texte ne contient pas toutes les lettres de l’alphabet.</p>

         </div>
      );
   };
});

export const Task2 = EpicComponent(self => {
  self.render = function () {
    return (
      <div className="taskInstructions">
         <h1>Substitution mono-alphabétique 2</h1>

         <p>Ce sujet est similaire au sujet précédent, avec une différence importante : les espaces ont été retirés du texte d’origine. Vous ne pouvez donc pas déterminer simplement où commence et se termine chaque mot du texte.</p>

         <p>Ceci le rend le texte plus difficile à décrypter. Il existe cependant une méthode très efficace que vous allez pouvoir utiliser : l’analyse de fréquences.</p>

         <h2>Principe de l’analyse de fréquence</h2>

         <p>On sait qu’en français, les lettres les plus fréquentes sont le 'e', le 'a' et le 's', dans cet ordre. On peut donc en déduire que le symbole le plus fréquent dans un texte chiffré par substitution a de bonnes chances de correspondre à la lettre 'e', et un peu moins de chances de correspondre à un 'a' ou un 's'. Au contraire, le symbole le plus fréquent du texte chiffré n’a quasiment aucune chance de correspondre à un 'k', qui est la lettre la moins fréquente en français.</p>

         <p>Pour exploiter ceci, dans l’outil d’édition de la substitution, une barre noire est représentée au dessus de chaque lettre. Sa hauteur représente la fréquence de cette lettre dans le texte chiffré, la barre la plus haute étant au dessus de la lettre la plus fréquente.</p>

         <img src="/images/frequencyAnalysis.png" alt="Visuel de l'outil d'analyse de fréquence" />

         <p>Par ailleurs, en dessous de chaque lettre déchiffrée, on représente par une barre noire la fréquence de cette lettre dans la langue française. Le 'e' a donc la barre la plus haute, suivi du 'a', etc.</p>

         <p>Enfin, on vous présente au départ les lettres chiffrées dans l’ordre de la plus fréquente dans le texte, à la moins fréquente, tandis que les lettres déchiffrées sont dans l’ordre de leur fréquence dans la langue française.</p>

         <p>Comme dans l’exercice précédent, vous pouvez déplacer les lettres déchiffrées pour les placer sous les lettres chiffrées auxquelles vous pensez qu’elles correspondent.</p>
      </div>
    );
  }
});

export default EpicComponent(self => {
  self.render = function () {
    const {task} = self.props;
    if (task.version == 1) {
      return <Task1 task={task}/>;
    }
    return <Task2 task={task}/>;
  }
});
