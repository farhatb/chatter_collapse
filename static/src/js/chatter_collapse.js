/** @odoo-module **/

/**
 * Chatter Collapse Functionality
 * Adds collapsible behavior to the chatter component
 */
class ChatterCollapseService {
    constructor() {
        this.isCollapsed = true; // Default state is collapsed
        this.toggleButtons = new Set();
    }

    /**
     * Initialize chatter collapse functionality
     */
    initializeChatterCollapse() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._setupChatterCollapse());
        } else {
            this._setupChatterCollapse();
        }
    }

    /**
     * Setup chatter collapse functionality
     */
    _setupChatterCollapse() {
        // Use MutationObserver to watch for dynamically added chatters
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this._processChatterElements(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Process existing elements
        this._processChatterElements(document.body);
    }

    /**
     * Process chatter elements in the given container
     */
    _processChatterElements(container) {
        const chatters = container.querySelectorAll('.oe_chatter');
        chatters.forEach(chatter => this._setupSingleChatter(chatter));
    }

    /**
     * Setup collapse functionality for a single chatter
     */
    _setupSingleChatter(chatter) {
        // Skip if already processed
        if (chatter.hasAttribute('data-chatter-processed')) {
            return;
        }

        chatter.setAttribute('data-chatter-processed', 'true');
        
        // Add classes for styling
        chatter.classList.add('chatter_collapsible');
        
        if (this.isCollapsed) {
            chatter.classList.add('chatter_collapsed');
            chatter.classList.remove('chatter_expanded');
            
            // Make form full width when chatter is collapsed by default
            this._expandFormToFullWidth(chatter);
        }

        // Create toggle button if it doesn't exist
        this._createToggleButton(chatter);
    }

    /**
     * Create toggle button for chatter
     */
    _createToggleButton(chatter) {
        // Check if toggle button already exists for this chatter
        const existingToggle = chatter.parentElement?.querySelector('.chatter_collapse_toggle');
        if (existingToggle) {
            this._bindToggleEvents(existingToggle, chatter);
            return;
        }

        // Create toggle button container
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'chatter_collapse_toggle';
        
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'btn btn-sm btn-outline-primary chatter_toggle_btn';
        toggleButton.title = 'Toggle Chatter';
        
        const icon = document.createElement('i');
        icon.className = 'fa fa-comments';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'chatter_toggle_text';
        textSpan.textContent = 'Messages';
        
        toggleButton.appendChild(icon);
        toggleButton.appendChild(textSpan);
        toggleContainer.appendChild(toggleButton);
        
        // Insert before chatter
        chatter.parentElement.insertBefore(toggleContainer, chatter);
        
        // Bind events
        this._bindToggleEvents(toggleContainer, chatter);
        this.toggleButtons.add(toggleButton);
    }

    /**
     * Bind toggle events
     */
    _bindToggleEvents(toggleContainer, chatter) {
        const button = toggleContainer.querySelector('.chatter_toggle_btn');
        if (!button) return;

        button.addEventListener('click', (event) => {
            event.preventDefault();
            this._toggleChatter(chatter, button);
        });
    }

    /**
     * Toggle chatter visibility
     */
    _toggleChatter(chatter, button) {
        const isCurrentlyCollapsed = chatter.classList.contains('chatter_collapsed');
        
        // Add loading state
        button.classList.add('loading');
        
        // Find the form container to expand when chatter is collapsed
        const formView = chatter.closest('.o_form_view') || document.querySelector('.o_form_view');
        const contentArea = document.querySelector('.o_content') || document.body;
        
        // Toggle classes with animation
        if (isCurrentlyCollapsed) {
            // Expanding chatter - form goes back to normal width
            chatter.classList.remove('chatter_collapsed');
            chatter.classList.add('chatter_expanded');
            this.isCollapsed = false;
            
            // Remove full-width form classes
            if (formView) formView.classList.remove('chatter_form_expanded');
            contentArea.classList.remove('chatter_form_expanded');
            document.body.classList.remove('chatter_form_expanded');
        } else {
            // Collapsing chatter - form expands to full width
            chatter.classList.add('chatter_collapsed');
            chatter.classList.remove('chatter_expanded');
            this.isCollapsed = true;
            
            // Add full-width form classes
            if (formView) formView.classList.add('chatter_form_expanded');
            contentArea.classList.add('chatter_form_expanded');
            document.body.classList.add('chatter_form_expanded');
        }
        
        // Update button text and icon
        this._updateToggleButton(button, !isCurrentlyCollapsed);
        
        // Remove loading state after animation
        setTimeout(() => {
            button.classList.remove('loading');
        }, 400);
        
        // Trigger resize event for Odoo components
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 450);
    }

    /**
     * Update toggle button appearance
     */
    _updateToggleButton(button, isCollapsed) {
        const textSpan = button.querySelector('.chatter_toggle_text');
        if (textSpan) {
            textSpan.textContent = isCollapsed ? 'Show Messages' : 'Hide Messages';
        }
        
        // Update button title
        button.title = isCollapsed ? 'Show Chatter' : 'Hide Chatter';
    }

    /**
     * Expand form to full width when chatter is collapsed
     */
    _expandFormToFullWidth(chatter) {
        const formView = chatter.closest('.o_form_view') || document.querySelector('.o_form_view');
        const contentArea = document.querySelector('.o_content') || document.body;
        
        // Add full-width form classes
        if (formView) formView.classList.add('chatter_form_expanded');
        contentArea.classList.add('chatter_form_expanded');
        document.body.classList.add('chatter_form_expanded');
    }
}

// Initialize the service
const chatterCollapseService = new ChatterCollapseService();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    chatterCollapseService.initializeChatterCollapse();
});

// Also initialize immediately in case DOM is already loaded
if (document.readyState !== 'loading') {
    chatterCollapseService.initializeChatterCollapse();
}

// Additional initialization for Odoo's dynamic loading
setTimeout(() => {
    const chatters = document.querySelectorAll('.oe_chatter');
    if (chatters.length > 0) {
        chatters.forEach(chatter => {
            chatterCollapseService._setupSingleChatter(chatter);
        });
    } else {
        // Retry for dynamically loaded content
        setTimeout(() => {
            const delayedChatters = document.querySelectorAll('.oe_chatter');
            delayedChatters.forEach(chatter => chatterCollapseService._setupSingleChatter(chatter));
        }, 2000);
    }
}, 1000);

// Export for potential use by other modules
export default chatterCollapseService;
