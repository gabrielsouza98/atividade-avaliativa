/* 1° questão
Não, pois as classes abstratas são projetadas para serem modelos, ou seja, fornecem uma estrutura comum e definem métodos abstratos que devem ser implementados por suas subclasses. No entanto, elas não fornecem uma implementação completa para esses métodos abstratos, deixando essa responsabilidade para as subclasses.

2° questão
Para compilação correta do codigo fornecido deve-se implementar o metodo criado na classe abstrata na nova classe que foi criada

3° questão
Se uma classe herda de uma classe abstrata e não implementa todos os métodos abstratos definidos pela classe pai (a classe abstrata), isso resultará em um erro de compilação.

4° questão 
typescript

abstract class FiguraGeometrica {
    abstract calcularArea(): number
    abstract calcularPerimetro(): number
}

class Quadrado extends FiguraGeometrica {
    private lado: number

    constructor(lado: number) {
        super()
        this.lado = lado
    }

    calcularArea(): number {
        return this.lado * this.lado
    }

    calcularPerimetro(): number {
        return 4 * this.lado
    }
}

class Triangulo extends FiguraGeometrica {
    private base: number
    private altura: number

    constructor(base: number, altura: number) {
        super()
        this.base = base
        this.altura = altura
    }

    calcularArea(): number {
        return (this.base * this.altura) / 2
    }

    calcularPerimetro(): number {
        console.warn("Perímetro de triângulo não é uma medida comum.")
        return 0
    }
}

5° questão
 é um tipo de array que pode conter objetos de qualquer classe que estenda ou implemente FiguraGeometrica. Isso é permitido porque, embora você não possa criar diretamente uma instância de uma classe abstrata usando new FiguraGeometrica(), você pode criar instâncias de classes concretas que herdam de FiguraGeometrica.


6° questão

abstract class Funcionario {
    protected salario: number;

    abstract getBonificacao(): number;
}

class Gerente extends Funcionario {
    constructor(salario: number) {
        super();
        this.salario = salario;
    }

    getBonificacao(): number {
        return this.salario * 0.4;
    }
}

class Diretor extends Funcionario {
    constructor(salario: number) {
        super();
        this.salario = salario;
    }

    getBonificacao(): number {
        return this.salario * 0.6;
    }
}

class Presidente extends Funcionario {
    constructor(salario: number) {
        super();
        this.salario = salario;
    }

    getBonificacao(): number {
        // Bonificação de 100% do salário + R$ 1.000,00
        return this.salario + 1000;
    }
}

7° questão
interface FiguraGeometrica {
    calcularArea(): number;
    calcularPerimetro(): number;
}

class Quadrado implements FiguraGeometrica {
    private lado: number;

    constructor(lado: number) {
        this.lado = lado;
    }

    calcularArea(): number {
        return this.lado * this.lado;
    }

    calcularPerimetro(): number {
        return 4 * this.lado;
    }
}

class Triangulo implements FiguraGeometrica {
    private base: number;
    private altura: number;

    constructor(base: number, altura: number) {
        this.base = base;
        this.altura = altura;
    }

    calcularArea(): number {
        return (this.base * this.altura) / 2;
    }

    calcularPerimetro(): number {
        console.warn("Perímetro de triângulo não é uma medida comum.");
        return 0;
    }
}

// Script de teste

const quadrado = new Quadrado(5);
console.log("Área do quadrado:", quadrado.calcularArea());
console.log("Perímetro do quadrado:", quadrado.calcularPerimetro());

const triangulo = new Triangulo(4, 3);
console.log("Área do triângulo:", triangulo.calcularArea());
console.log("Perímetro do triângulo:", triangulo.calcularPerimetro());

8° questão
interface IComparavel {
    comparar(outraForma: FiguraGeometrica): number
}

abstract class FiguraGeometrica {
    abstract calcularArea(): number
    abstract calcularPerimetro(): number
}

class Quadrado implements FiguraGeometrica, IComparavel {
    private lado: number

    constructor(lado: number) {
        this.lado = lado
    }

    calcularArea(): number {
        return this.lado * this.lado
    }

    calcularPerimetro(): number {
        return 4 * this.lado
    }

    comparar(outraForma: FiguraGeometrica): number {
        const areaQuadrado = this.calcularArea()
        const areaOutraForma = outraForma.calcularArea()

        if (areaQuadrado < areaOutraForma) {
            return -1
        } else if (areaQuadrado > areaOutraForma) {
            return 1
        } else {
            return 0
        }
    }
}

class Triangulo implements FiguraGeometrica, IComparavel {
    private base: number
    private altura: number

    constructor(base: number, altura: number) {
        this.base = base
        this.altura = altura
    }

    calcularArea(): number {
        return (this.base * this.altura) / 2
    }

    calcularPerimetro(): number {
        console.warn("Perímetro de triângulo não é uma medida comum.")
        return 0
    }

    comparar(outraForma: FiguraGeometrica): number {
        const areaTriangulo = this.calcularArea()
        const areaOutraForma = outraForma.calcularArea()

        if (areaTriangulo < areaOutraForma) {
            return -1
        } else if (areaTriangulo > areaOutraForma) {
            return 1
        } else {
            return 0
        }
    }
}
 9° questão
 class TesteFormasGeometricas {
    constructor() {}

    executarTeste(forma1: IComparavel, forma2: FiguraGeometrica) {
        const resultadoComparacao = forma1.comparar(forma2)

        console.log("Comparação de áreas:")
        console.log("Área da Forma 1:", forma1.calcularArea())
        console.log("Área da Forma 2:", forma2.calcularArea())
        console.log("Resultado da comparação:", resultadoComparacao)
        console.log("---------------------------------")
    }
}

Exemplo de uso:

const testeFormas = new TesteFormasGeometricas()

const quadrado = new Quadrado(5)
const triangulo = new Triangulo(4, 3)
const outroQuadrado = new Quadrado(8)
const outroTriangulo = new Triangulo(6, 4)

testeFormas.executarTeste(quadrado, triangulo)
testeFormas.executarTeste(quadrado, outroQuadrado)
testeFormas.executarTeste(triangulo, outroTriangulo)

