function YYini = load_entities_for_scenario(scenario_id)
% LOAD_ENTITIES_FOR_SCENARIO  Read welly entities_object for a given scenario.
%
%   YYini = load_entities_for_scenario(62)
%
%   Calls the entities_api.php REST endpoint and maps each entity's
%   role/var/val rows to the standard yinigeneric struct layout.
%
%   Requires: MATLAB R2016b+ (webread, jsondecode).

API = 'http://localhost/e-nologo/e-nologo-interactive/public/php/entities_api.php';

% ── Template struct ────────────────────────────────────────────────────────────
yinigeneric.id              = [];
yinigeneric.src             = '';
yinigeneric.code            = '';   % numeric code (e.g. for wines)
yinigeneric.iYMAIN          = [];
yinigeneric.TTNAME          = [];
yinigeneric.PPATTNAME       = [];
yinigeneric.PRNAMETTNAME    = [];
yinigeneric.EENAME          = [];
yinigeneric.EEUNAME         = [];
yinigeneric.EENAME2PPATTNAME = [];
yinigeneric.EENAME2AAQUEST  = [];

% ── 1. Get entity names for this scenario ─────────────────────────────────────
url_list = sprintf('%s?action=list_entities&scenario_id=%s', API, num2str(scenario_id));
resp_list = webread(url_list);
entity_names = resp_list.entities;   % cell array of entity name strings

if isempty(entity_names)
    warning('load_entities_for_scenario: no entities found for scenario_id %d', scenario_id);
    YYini = [];
    return;
end

YYini = [];

% ── 2. For each entity, fetch details and populate struct ─────────────────────
for k = 1:numel(entity_names)
    obj = entity_names{k};

    url_ent  = sprintf('%s?action=get_entity&obj=%s', API, urlencode(obj));
    resp_ent = webread(url_ent);

    yini    = yinigeneric;
    yini.id = obj;

    if ~isfield(resp_ent, 'roles') || isempty(fieldnames(resp_ent.roles))
        YYini = [YYini; yini]; %#ok<AGROW>
        continue;
    end

    roles      = resp_ent.roles;
    role_names = fieldnames(roles);

    for r = 1:numel(role_names)
        role = role_names{r};
        vars = roles.(role);   % struct array: id, role, var, val, type, flag

        switch role

            % ── Simple source / availability ──────────────────────────────
            case 'io'
                for i = 1:numel(vars)
                    v = vars(i);
                    switch v.var
                        case 'src',   yini.src  = v.val;
                        case 'code',  yini.code = v.val;
                    end
                end

            % ── Main activation flag ───────────────────────────────────────
            case 'interyy'
                for i = 1:numel(vars)
                    v = vars(i);
                    if strcmp(v.var, 'iYMAIN')
                        yini.iYMAIN = parse_num(v.val, 1);
                    end
                end

            % ── Attribute/concept names (TTNAME)  { name, weight } ────────
            case 'TTNAME'
                C = cell(numel(vars), 2);
                for i = 1:numel(vars)
                    C{i,1} = vars(i).var;
                    C{i,2} = parse_num(vars(i).val, 1);
                end
                yini.TTNAME = C;

            % ── Physical attributes (PPATTNAME)  { name, weight } ─────────
            case 'PPATTNAME'
                C = cell(numel(vars), 2);
                for i = 1:numel(vars)
                    C{i,1} = vars(i).var;
                    C{i,2} = parse_num(vars(i).val, 1);
                end
                yini.PPATTNAME = C;

            % ── Proprioception → TTNAME  { {prop}, {tt...}, weight } ──────
            % DB var format: 'myrole:groupleader', 'myrole:person', ...
            case 'PRNAMETTNAME'
                yini.PRNAMETTNAME = build_prname_map(vars);

            % ── Emotion states  { name, weight } ──────────────────────────
            case 'EENAME'
                C = cell(numel(vars), 2);
                for i = 1:numel(vars)
                    C{i,1} = vars(i).var;
                    C{i,2} = parse_num(vars(i).val, 1);
                end
                yini.EENAME = C;

            case 'EEUNAME'
                C = cell(numel(vars), 2);
                for i = 1:numel(vars)
                    C{i,1} = vars(i).var;
                    C{i,2} = parse_num(vars(i).val, 1);
                end
                yini.EEUNAME = C;

            % ── Emotion → PPATTNAME  { {ee}, {att...}, weight } ──────────
            case 'EENAME2PPATTNAME'
                yini.EENAME2PPATTNAME = build_prname_map(vars);

            % ── Emotion → Quest  { {ee}, {quest...}, weight } ─────────────
            case 'EENAME2AAQUEST'
                yini.EENAME2AAQUEST = build_prname_map(vars);

            case 'scenarios'
                % internal metadata row – skip

            otherwise
                % unknown role – skip silently
        end
    end

    YYini = [YYini; yini]; %#ok<AGROW>
end

end % main function

% ── Helper: safe numeric parse ────────────────────────────────────────────────
function n = parse_num(s, default_val)
    n = str2double(s);
    if isnan(n)
        n = default_val;
    end
end

% ── Helper: group 'propname:ttname' rows → { {prop}, {tt1,tt2,...}, weight } ─
% Used for PRNAMETTNAME, EENAME2PPATTNAME, EENAME2AAQUEST.
function C = build_prname_map(vars)
    keys      = {};
    tt_groups = {};
    weights   = [];

    for i = 1:numel(vars)
        v     = vars(i);
        parts = strsplit(v.var, ':');
        if numel(parts) >= 2
            propname = parts{1};
            ttname   = strjoin(parts(2:end), ':');   % re-join for extra colons
        else
            propname = v.var;
            ttname   = '';
        end
        w = parse_num(v.val, 1);

        idx = find(strcmp(keys, propname), 1);
        if isempty(idx)
            keys{end+1}      = propname;     %#ok<AGROW>
            tt_groups{end+1} = {ttname};     %#ok<AGROW>
            weights(end+1)   = w;            %#ok<AGROW>
        else
            tt_groups{idx}{end+1} = ttname;
            weights(idx) = w;
        end
    end

    % Output: { {'propname'}, {'tt1','tt2',...}, weight }
    C = cell(numel(keys), 3);
    for i = 1:numel(keys)
        C{i,1} = {keys{i}};
        C{i,2} = tt_groups{i};
        C{i,3} = weights(i);
    end
end
