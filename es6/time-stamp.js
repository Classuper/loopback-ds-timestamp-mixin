import _debug from './debug';

const debug = _debug();
const warn = _debug(); // create a namespaced warning
warn.log = console.warn.bind(console); // eslint-disable-line no-console

export default (Model, bootOptions = {}) => {
  debug('TimeStamp mixin for Model %s', Model.modelName);

  const options = Object.assign({
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    required: true,
    validateUpsert: false, // default to turning validation off
    silenceWarnings: false,
    index: false,
  }, bootOptions);

  debug('options', options);

  if (typeof options.createdAt === 'string') {
    options.createdAt = {
      name: options.createdAt,
      required: options.required,
    };
  }

  if (typeof options.updatedAt === 'string') {
    options.updatedAt = {
      name: options.updatedAt,
      required: options.required,
    };
  }

  // enable our warnings via the options
  warn.enabled = !options.silenceWarnings;

  if (!options.validateUpsert && Model.settings.validateUpsert) {
    Model.settings.validateUpsert = false;
    warn(`${Model.pluralModelName} settings.validateUpsert was overriden to false`);
  }

  if (Model.settings.validateUpsert && (options.createdAt.required || options.updatedAt.required)) {
    warn(`Upserts for ${Model.pluralModelName} will fail when
          validation is turned on and time stamps are required`);
  }

  Model.defineProperty(options.createdAt.name, {
    type: Date,
    defaultFn: 'now',
    index: options.index,
    ...options.createdAt,
  });

  Model.defineProperty(options.updatedAt.name, {
    type: Date,
    index: options.index,
    ...options.updatedAt,
  });

  Model.observe('before save', (ctx, next) => {
    debug('ctx.options', ctx.options);
    if (ctx.options && ctx.options.skipUpdatedAt) {
      return next();
    }
    if (ctx.instance) {
      debug('%s.%s before save: %s', ctx.Model.modelName, options.updatedAt.name, ctx.instance.id);
      ctx.instance[options.updatedAt.name] = new Date();
    } else {
      debug('%s.%s before update matching %j',
        ctx.Model.pluralModelName, options.updatedAt.name, ctx.where);
      ctx.data[options.updatedAt.name] = new Date();
    }
    return next();
  });
};

module.exports = exports.default;
