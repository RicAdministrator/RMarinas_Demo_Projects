const filters = {};

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function getProjectText(project) {
  const tech = (project.techUsed || []).join(' ');
  const repoList = (Array.isArray(project.repo) ? project.repo : project.repo ? [project.repo] : [])
    .map((repo) => typeof repo === 'string' ? repo : `${repo.label || ''} ${repo.url || ''}`)
    .join(' ');
  const demoList = (project.demos || [])
    .map((demo) => `${demo.label || ''} ${demo.url || ''}`)
    .join(' ');

  return {
    projectName: normalizeText(project.projectName),
    techUsed: normalizeText(tech),
    repo: normalizeText(repoList),
    demos: normalizeText(demoList)
  };
}

function updateProjectCount(filteredProjects, totalProjects) {
  const countLabel = document.getElementById('project-count');
  if (!countLabel) return;
  countLabel.textContent = `Showing ${filteredProjects.length} out of ${totalProjects} projects`;
}

function renderProjects(projects) {
  const tbody = document.getElementById('project-table-body');

  const filteredProjects = projects.filter((project) => {
    const text = getProjectText(project);
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return text[key].includes(normalizeText(value));
    });
  });

  updateProjectCount(filteredProjects, projects.length);

  tbody.innerHTML = filteredProjects
    .map((project) => {
      const techHtml = project.techUsed && project.techUsed.length
        ? project.techUsed.join('<br>')
        : 'N/A';

      const repoItems = Array.isArray(project.repo)
        ? project.repo
        : project.repo
          ? [project.repo]
          : [];

      const repoHtml = repoItems.length
        ? repoItems
            .map((repo) => {
              const url = typeof repo === 'string' ? repo : repo.url;
              const label = typeof repo === 'string' ? 'Repo' : (repo.label || 'Repo');
              return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
            })
            .join('<br>')
        : 'N/A';

      const demosHtml = project.demos && project.demos.length
        ? project.demos
            .map((demo) => `<a href="${demo.url}" target="_blank" rel="noopener noreferrer">${demo.label || 'Demo'}</a>`)
            .join('<br>')
        : 'N/A';

      return `
        <tr>
          <td>${project.projectName}</td>
          <td>${techHtml}</td>
          <td>${repoHtml}</td>
          <td>${demosHtml}</td>
        </tr>
      `;
    })
    .join('');
}

fetch('data.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Unable to load data.json');
    }
    return response.json();
  })
  .then((projects) => {
    renderProjects(projects);

    document.querySelectorAll('[data-filter]').forEach((input) => {
      input.addEventListener('input', (event) => {
        const key = event.target.dataset.filter;
        filters[key] = event.target.value;
        renderProjects(projects);
      });
    });
  })
  .catch((error) => {
    const tbody = document.getElementById('project-table-body');
    tbody.innerHTML = '<tr><td colspan="4">Unable to load project data.</td></tr>';
    console.error(error);
  });
