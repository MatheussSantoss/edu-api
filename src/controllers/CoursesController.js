const knex = require('../databases/knex');
const fieldValidator = require('../utils/FieldValidator');

exports.create = async (req, res) => {
  try {
    const course = req.body;

    const invalidFields = fieldValidator(course, ['title', 'description']);

    if (invalidFields.length) {
      return res.status(400).send({ 
        status: 'invalid request',
        invalidFields
      });
    }

    const [courseCreatedId] = await knex.insert(course).into('courses');
    
    const [courseCreated] = await knex.select('*').from('courses').where({ id: courseCreatedId });

    return res.status(200).send({
      status: 'success',
      data: courseCreated
    })
  } catch (e) {
    return res.status(500).send({ error: e.message || e });
  }
};

exports.find = async (req, res) => {
  try {
    const courses = await knex.select('*').from('courses');
    return res.status(200).send(courses);
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};

exports.findById = async (req, res) => {
  try {
    const {id} = req.params.id;
    const course = await knex.select('*').from('courses').where({id}).first();
    if(!course) {
      return res.status(404).send({ status: `Curso com id ${id} não foi encontrado` });
    }

    const lessons = await knex.select('*').from('lessons').where({courseId: id});
    return res.status(200).send({
      ...course,// "..." pega todos os atributos
      lessons
    });
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};

exports.update = async (req, res) => {
  try {
    const {id} = req.params;
    const newCourse = req.body;
    const course = await knex.select(['id']).from('courses').where({id}).first();

    if(!course) {
      return res.status(404).send({
        status: `Nenhum curso com o id ${id} foi encontrado`
      })
    }

    await knex.update(newCourse).from('courses').where({id});
    const courseUpdated = await knex.select('*').from('courses').where({id}).first();
    return res.status(200).send(courseUpdated)
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};

exports.delete = async (req, res) => {
  try {
    const {id} = req.params;
    const [course] = await knex.select('id').from('courses').where({id}).first(); 

    if(!course) {
      return res.status(404).send(`O curso com id: ${id} não existe`);
    }
    await knex.delete({title: course.title}).from('courses').where({id});
    return res.status(203).send({ status:'Curso deletado com sucesso', data: course});
  } catch (e) {
    return res.status(500).send({ error: e?.message || e });
  }
};