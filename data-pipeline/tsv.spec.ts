import { describe, expect, it } from 'vitest';

import { campo, parsearTsv } from './tsv';

const COLUMNAS = ['id', 'forma', 'comentario'] as const;
const OPCIONES = { nombre: 'prueba.tsv', columnas: COLUMNAS };

const tsv = (...lineas: string[]) => lineas.join('\n');

describe('parsearTsv', () => {
	it('parsea encabezado y filas', () => {
		const filas = parsearTsv(tsv('id\tforma\tcomentario', '1\tckabur\tmontaña'), OPCIONES);

		expect(filas).toEqual([{ id: '1', forma: 'ckabur', comentario: 'montaña' }]);
	});

	it('acepta CRLF y LF en el mismo pipeline', () => {
		const conCrlf = parsearTsv('id\tforma\tcomentario\r\n1\tckabur\tx\r\n', OPCIONES);
		const conLf = parsearTsv('id\tforma\tcomentario\n1\tckabur\tx\n', OPCIONES);

		expect(conCrlf).toEqual(conLf);
	});

	it('saca el BOM, que si no rompe el nombre de la primera columna', () => {
		const filas = parsearTsv('\uFEFFid\tforma\tcomentario\n1\tckabur\tx', OPCIONES);

		expect(filas[0]?.id).toBe('1');
	});

	it('conserva los campos vacíos como string vacío', () => {
		const filas = parsearTsv(tsv('id\tforma\tcomentario', '1\tckabur\t'), OPCIONES);

		expect(filas[0]?.comentario).toBe('');
	});

	it('ignora la línea final vacía', () => {
		const filas = parsearTsv(tsv('id\tforma\tcomentario', '1\tckabur\tx', ''), OPCIONES);

		expect(filas).toHaveLength(1);
	});

	it('no toca las comillas: en TSV son datos, no delimitadores', () => {
		const filas = parsearTsv(tsv('id\tforma\tcomentario', '1\tckabur\tdijo "hola"'), OPCIONES);

		expect(filas[0]?.comentario).toBe('dijo "hola"');
	});

	it('no recorta los espacios internos del campo', () => {
		const filas = parsearTsv(tsv('id\tforma\tcomentario', '1\tsu ci\tx'), OPCIONES);

		expect(filas[0]?.forma).toBe('su ci');
	});
});

describe('parsearTsv — verifica sus premisas', () => {
	/**
	 * El chequeo que importa. Si una fuente regenera el archivo con un tabulador
	 * adentro de un campo, esto lo atrapa en vez de correr los datos una columna
	 * y guardar basura con apariencia de dato.
	 */
	it('falla si una línea tiene más campos que el encabezado', () => {
		expect(() =>
			parsearTsv(tsv('id\tforma\tcomentario', '1\tckabur\tcon\ttab'), OPCIONES)
		).toThrow(/línea 2/);
	});

	it('falla si una línea tiene menos campos que el encabezado', () => {
		expect(() => parsearTsv(tsv('id\tforma\tcomentario', '1\tckabur'), OPCIONES)).toThrow(
			/línea 2/
		);
	});

	it('falla si falta una columna requerida', () => {
		expect(() => parsearTsv(tsv('id\tforma', '1\tckabur'), OPCIONES)).toThrow(/comentario/);
	});

	it('falla con el archivo vacío', () => {
		expect(() => parsearTsv('', OPCIONES)).toThrow(/vacío/);
	});

	it('nombra el archivo en el error, para saber cuál de los dos crudos falló', () => {
		expect(() => parsearTsv('', OPCIONES)).toThrow(/prueba\.tsv/);
	});
});

describe('campo', () => {
	it('devuelve el valor', () => {
		expect(campo({ id: '1' }, 'id')).toBe('1');
	});

	it('falla si la columna no está', () => {
		expect(() => campo({ id: '1' }, 'forma')).toThrow(/forma/);
	});
});