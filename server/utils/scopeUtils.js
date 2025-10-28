const SCOPES = ['ours', 'mine', 'partner'];

const PERSONAL_SPLIT_TYPES = ['personal', 'personal_only'];

const sanitizeScope = (candidate) => {
  if (!candidate || typeof candidate !== 'string') {
    return 'ours';
  }
  const normalized = candidate.toLowerCase();
  return SCOPES.includes(normalized) ? normalized : 'ours';
};

const isPersonalSplit = (splitType) => {
  if (!splitType) return false;
  return PERSONAL_SPLIT_TYPES.includes(String(splitType).toLowerCase());
};

const resolveScopeContext = async (db, userId, requestedScope) => {
  const sanitizedScope = sanitizeScope(requestedScope);

  const currentUser = await db('users').where('id', userId).first();
  if (!currentUser) {
    throw new Error('User not found');
  }

  let partner = null;
  if (currentUser.partner_id) {
    partner = await db('users').where('id', currentUser.partner_id).first();
  }

  const partnerId = partner?.id ?? null;
  const hasPartner = Boolean(partnerId);

  let effectiveScope = sanitizedScope;
  if (effectiveScope === 'partner' && !hasPartner) {
    effectiveScope = 'mine';
  }

  const scopeConfig = {
    ours: {
      payerIds: hasPartner ? [currentUser.id, partnerId] : [currentUser.id],
      includePersonal: false,
      sharedOnly: true
    },
    mine: {
      payerIds: [currentUser.id],
      includePersonal: true,
      sharedOnly: false
    },
    partner: {
      payerIds: hasPartner ? [partnerId] : [],
      includePersonal: true,
      sharedOnly: false
    }
  };

  let viewerId = currentUser.id;
  let counterpartId = partnerId;
  if (effectiveScope === 'partner' && hasPartner) {
    viewerId = partnerId;
    counterpartId = currentUser.id;
  }

  return {
    requestedScope: sanitizedScope,
    scope: effectiveScope,
    currentUser,
    partner,
    hasPartner,
    viewerId,
    counterpartId,
    ...scopeConfig[effectiveScope]
  };
};

module.exports = {
  sanitizeScope,
  isPersonalSplit,
  resolveScopeContext
};
